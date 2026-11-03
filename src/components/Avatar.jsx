import { useState } from "react";
import PropTypes from "prop-types";
import { useContent } from "../context/content";
import { publicUrl } from "../lib/paths";

export default function Avatar({ size = "lg" }) {
  const { profile: profileData } = useContent();
  const [failed, setFailed] = useState(false);
  const showPhoto = profileData.photo && !failed;

  return (
    <span className={`avatar avatar-${size}`}>
      {showPhoto ? (
        <img src={publicUrl(profileData.photo)} alt={profileData.displayName} onError={() => setFailed(true)} />
      ) : (
        <span aria-hidden="true">{profileData.initials}</span>
      )}
    </span>
  );
}

Avatar.propTypes = {
  size: PropTypes.oneOf(["sm", "lg"])
};
