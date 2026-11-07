import PropTypes from "prop-types";
import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";
import Seo from "../components/Seo";
import {
  CloseIcon,
  DownloadIcon,
  ExpandIcon,
  ExternalLinkIcon,
  GitHubIcon,
  KaggleIcon,
  LinkIcon,
  LinkedInIcon,
  MailIcon,
  XBrandIcon
} from "../components/Icons";
import { useContent } from "../context/content";
import { siteConfig } from "../data/profileData";
import { slugify } from "../lib/format";
import { publicUrl } from "../lib/paths";

function platformIcon(platform) {
  const name = platform.toLowerCase();
  if (name.includes("linkedin")) {
    return LinkedInIcon;
  }
  if (name.includes("github")) {
    return GitHubIcon;
  }
  if (name.includes("kaggle")) {
    return KaggleIcon;
  }
  if (name === "x" || name.includes("twitter")) {
    return XBrandIcon;
  }
  if (name.includes("mail")) {
    return MailIcon;
  }
  return LinkIcon;
}

// Shown until QR codes are added under Admin > Sections > QR codes.
function defaultCodes(profile) {
  const lastSegment = (url) => url.replace(/\/+$/, "").split("/").pop();
  return [
    { platform: "Website", handle: new URL(siteConfig.siteUrl).host, url: siteConfig.siteUrl },
    profile.linkedin && { platform: "LinkedIn", handle: lastSegment(profile.linkedin), url: profile.linkedin },
    profile.github && { platform: "GitHub", handle: lastSegment(profile.github), url: profile.github },
    profile.kaggle && { platform: "Kaggle", handle: lastSegment(profile.kaggle), url: profile.kaggle }
  ].filter(Boolean);
}

// An uploaded image is used as is. Otherwise the code is drawn from the link: dark on white
// with a quiet zone, which every phone camera reads whatever the site theme.
function useQrImage(url, image) {
  const [generated, setGenerated] = useState(null);

  useEffect(() => {
    if (image) {
      return undefined;
    }
    let active = true;
    QRCode.toDataURL(url, {
      width: 640,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#170f25", light: "#ffffff" }
    })
      .then((data) => active && setGenerated(data))
      .catch(() => active && setGenerated(null));
    return () => {
      active = false;
    };
  }, [url, image]);

  return image ? publicUrl(image) : generated;
}

function fileName(owner, code) {
  const extension = code.image ? (code.image.match(/\.(png|jpe?g|gif|webp)$/i)?.[1] ?? "png") : "png";
  return `${slugify(owner)}-${slugify(code.platform)}-qr.${extension.toLowerCase()}`;
}

const codeShape = PropTypes.shape({
  platform: PropTypes.string.isRequired,
  handle: PropTypes.string,
  url: PropTypes.string.isRequired,
  image: PropTypes.string
});

function QrCard({ code, owner, onExpand }) {
  const src = useQrImage(code.url, code.image);
  const Icon = platformIcon(code.platform);

  return (
    <article className="card qr-card">
      <header className="qr-card-head">
        <span className="qr-platform-icon">
          <Icon />
        </span>
        <div className="qr-card-text">
          <h2 className="card-title">{code.platform}</h2>
          {code.handle && <p className="muted small">{code.handle}</p>}
        </div>
      </header>

      <button
        type="button"
        className="qr-frame"
        onClick={() => onExpand({ code, src })}
        disabled={!src}
        data-track={`${code.platform} QR: Full screen`}
        aria-label={`Show the ${code.platform} QR code full screen`}
      >
        {src ? (
          <img src={src} alt={`QR code for ${code.platform}`} className={code.image ? undefined : "qr-generated"} />
        ) : (
          <span className="spinner" aria-hidden="true" />
        )}
        <span className="qr-expand-hint" aria-hidden="true">
          <ExpandIcon />
        </span>
      </button>

      <div className="qr-actions">
        <a
          className="btn btn-secondary btn-sm"
          href={code.url}
          target="_blank"
          rel="me noopener noreferrer"
          data-track={`${code.platform} QR: Open`}
        >
          <ExternalLinkIcon />
          Open
        </a>
        {src && (
          <a className="btn btn-secondary btn-sm" href={src} download={fileName(owner, code)} data-track={`${code.platform} QR: Save`}>
            <DownloadIcon />
            Save
          </a>
        )}
      </div>
    </article>
  );
}

QrCard.propTypes = {
  code: codeShape.isRequired,
  owner: PropTypes.string.isRequired,
  onExpand: PropTypes.func.isRequired
};

// Full-screen view for showing a code to someone in person.
function QrDialog({ entry, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (entry && dialog && !dialog.open) {
      dialog.showModal();
    }
  }, [entry]);

  return (
    // Clicks on the backdrop land on the <dialog> itself and close it; Escape closes it natively.
    <dialog ref={ref} className="qr-dialog" onClose={onClose} onClick={(event) => event.target === ref.current && ref.current.close()}>
      {entry && (
        <div className="qr-dialog-body">
          <button type="button" className="qr-dialog-close" onClick={() => ref.current.close()} aria-label="Close">
            <CloseIcon />
          </button>
          <img src={entry.src} alt={`QR code for ${entry.code.platform}`} className={entry.code.image ? undefined : "qr-generated"} />
          <p className="qr-dialog-title">{entry.code.platform}</p>
          {entry.code.handle && <p className="qr-dialog-handle">{entry.code.handle}</p>}
        </div>
      )}
    </dialog>
  );
}

QrDialog.propTypes = {
  entry: PropTypes.shape({ code: codeShape.isRequired, src: PropTypes.string.isRequired }),
  onClose: PropTypes.func.isRequired
};

export default function QrPage() {
  const { profile } = useContent();
  const [expanded, setExpanded] = useState(null);
  const codes = profile.qrCodes?.length ? profile.qrCodes : defaultCodes(profile);

  return (
    <div className="container qr-page">
      <Seo
        title="QR Codes"
        description={`Scan to connect with ${profile.displayName} on ${codes.map((code) => code.platform).join(", ")}.`}
        path="/qr"
      />

      <header className="qr-header">
        <h1 className="gradient-text">Scan &amp; Connect</h1>
        <p>Point your phone camera at a code to find me there. Tap a code to show it full screen.</p>
      </header>

      <div className="qr-grid">
        {codes.map((code, index) => (
          <QrCard key={`${code.platform}-${index}`} code={code} owner={profile.displayName} onExpand={setExpanded} />
        ))}
      </div>

      <QrDialog entry={expanded} onClose={() => setExpanded(null)} />
    </div>
  );
}
