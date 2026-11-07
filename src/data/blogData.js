// Initial blog posts. The API seeds its database from this file on first start; after that,
// write and edit posts in /admin. Post content is Markdown (see src/lib/markdown.js):
//   ## Heading / ### Subheading     (## headings build the table of contents)
//   - item  or  1. item             lists
//   > quote
//   ```lang ... ```                 code blocks
//   ![alt](url "caption")           image on its own line
//   @[video](url poster-url "caption")      click-to-play video
//   @[animation](url poster-url "caption")  silent looping clip that plays like a GIF
//   @[youtube](video-id "title")
//   **bold**, `code`, [link](url)   inside paragraphs
// Optional post fields: subtitle, featured, status ("Completed" | "In Progress"), cover,
// stack (tech chips), links: { source, demo }.
export const blogPosts = [
  {
    id: "predicting-penalty-kicks-from-run-up-video",
    title: "Reading a Penalty Before It's Taken",
    subtitle: "Predicting kick direction and the goalkeeper's dive from run-up video that stops 0.02 s before contact",
    date: "2026-11-07",
    category: "Computer Vision",
    tags: ["computer vision", "pose estimation", "video", "ensembles", "kaggle"],
    featured: true,
    status: "Completed",
    cover: "/projects/penalty-kick/cover.jpg",
    stack: ["PyTorch", "YOLO11x", "RTMPose", "DINOv2", "ConvNeXt", "R(2+1)D", "LightGBM", "OWLv2"],
    summary:
      "How I built a video pipeline that predicts where a penalty goes and which way the keeper dives, from footage that ends just before the ball is struck, and why I trusted cross-validation over the leaderboard.",
    content: `In a penalty, the goalkeeper has to guess. The question behind this project was whether a model can make that call **before** the ball is struck: watching only the run-up, predict where the kick will go and which way the goalkeeper will move.

This was Project 3 of NYU's CS-GY 6643 (Computer Vision), run as a class Kaggle competition. We entered as a two-person team, and I built the entire pipeline, from detection to the final ensemble. Every clip stops **0.02 seconds before the kicker's foot meets the ball**, so the model never sees the strike or what happens after it.

@[animation](/projects/penalty-kick/pipeline.mp4 /projects/penalty-kick/pipeline-poster.jpg "The pipeline in seven steps (an illustration, not real match footage)")

## The problem

Each clip gets two three-way labels, both from the **kicker's point of view** facing the goal:

- **Kick direction:** left, middle or right
- **Goalkeeper:** dives left, stays in the middle, or dives right

The score is **0.7 × kick accuracy + 0.3 × keeper accuracy**. The public leaderboard uses 360 test clips; the private leaderboard, which sets the final ranking, uses the other 540. The course's sample submission (always "left") scores 0.514.

The data is 2,200 broadcast clips from 215 source videos of men's and women's matches: shootouts, highlights and compilations. 1,300 are labelled for training and 900 are test clips. The course staff provided the labels and contact times.

Stopping the clip early is what makes it hard:

- Kickers disguise their intent, and the decisive hip and foot angle happens at contact, after the cut.
- Broadcast camera angles vary a lot, and some clips are mirrored.
- The frame is crowded: referees and other players stand near the kicker.
- Clips run from 0.3 to 9.8 seconds (median 1.9 s).
- Middle kicks are rare (14%) and almost unpredictable.

## Step 1: Find the right people

Before any model can read body language, the pipeline has to know who the kicker and keeper are, and where the ball and goal are.

- **YOLO11x** detects and tracks people and the ball on a 25 Hz time grid.
- **OWLv2** finds the goal mouth.
- The **penalty ball** is found by consensus: it's the object that stays still across frames.
- A **pair-ranking picker** scores candidate kicker/keeper pairs by their geometry relative to the ball and goal, and a **DINOv2 appearance check** rescues wrong kicker picks.
- **Pitch calibration** (PnLCalib) tells us the camera view.
- Every clip is **mirrored into one canonical frame**, with the goal on the same side, and the kicker's preferred foot taken into account.

That last step matters more than it sounds. A left-footed kicker's "natural" side is the mirror image of a right-footer's, so normalising for it lets the model learn one pattern instead of two.

## Step 2: Pose and motion features

With the right two people found, **RTMPose** extracts 26-keypoint skeletons for kicker and keeper. I added optical flow (how each part of the body is moving) and geometry: angles and distances relative to the ball and goal.

My first model was **LightGBM** on these features. Most of the early gains came from cleaner inputs rather than cleverer models. On the public leaderboard:

- First LightGBM: **0.710**
- Better kicker/keeper picker: **0.715**
- Mirroring by preferred foot: **0.724**
- Final frames at full frame rate: **0.731**
- Ball checks, picker fixes and keeper optical flow: **0.749**

I didn't run a clean per-feature importance study, so I can't tell you which single feature mattered most. Those steps are what moved the score.

## Step 3: Let pretrained vision models look

Hand-built features capture what I thought mattered. Pretrained vision models can pick up what I didn't think of. I fine-tuned several families and compared their **kick accuracy** in cross-validation:

- Pose and physics features with LightGBM or TabICL: ~0.67–0.69
- R(2+1)D video models: ~0.61–0.67
- ConvNeXt, per frame: ~0.69–0.70
- DINOv2 ViT-B: 0.732
- DINOv2 ViT-L: 0.736
- **Stacked ensemble: 0.749** (keeper 0.922, overall score 0.801)

The biggest surprise of the project: **generic DINOv2 frame features beat my hand-built pose features** for kick direction.

## Step 4: Stack fourteen models

No single family won everywhere, so I combined fourteen models with a **logistic-regression stack trained on out-of-fold predictions**. Each model's predictions on data it never trained on became inputs to a small model that learns how much to trust each one.

On the public leaderboard, that went from LightGBM's 0.710 to about 0.77 with stacked R(2+1)D models, then 0.807, and **0.826** once ConvNeXt and DINOv2 joined the stack.

## Validation I could trust

The course README warned that clips from the same shootout leak between folds, so from day one I validated with **source-grouped 5-fold cross-validation, repeated over 3 seeds**: all clips from one source video stay in the same fold.

The harder lesson came later. With only 360 clips on the public leaderboard, a few clips swing the score, and my cross-validation and the leaderboard sometimes disagreed. I picked submissions by cross-validation, using decision rules I fixed in advance. That's why the final selected submission isn't the one with the best public score (0.826): I chose the one with the strongest cross-validation (**0.801 CV, 0.819 public**). The private leaderboard will show whether that was right; it hasn't been released yet.

## What didn't work

All of these failed to beat my cross-validation bar, missing it by 0.000–0.003:

- **LoRA fine-tuning of DINOv2:** kick accuracy around 0.51, far below full fine-tuning
- A joint three-class combiner aimed at middle kicks
- Bigger bags of DINOv2-L networks
- A DINOv2-L model on the keeper's view, and a three-view model
- DINOv2-giant, dropped because of its compute cost

## Why the keeper is easier than the kicker

The keeper model reaches about **92%** accuracy; kick direction sits around **75%**. The asymmetry makes sense once you watch the clips:

- Goalkeepers start shifting their weight, or even moving, before contact, and that's visible in the clip.
- Kickers deliberately hide their intent until contact, and the clip ends just before it.

A single model looking only at the keeper's crop gets to about 92% on its own. Middle kicks, by contrast, stayed essentially unpredictable: my models separate them only slightly better than chance.

## Compute

Everything trained on NYU's HPC course cluster: NVIDIA A100 40 GB GPUs under Slurm, in Singularity containers, often with several training processes sharing one GPU. The course budget was 300 GPU-hours per student. Retraining the final ensemble from scratch takes about 140 A100-hours.

## The takeaway

> With a small public leaderboard, a few clips swing the ranking. Decide how you'll choose before you see the results, validate grouped by source, and trust cross-validation over the leaderboard.

I'll update this post with the final rank once the private leaderboard is out.`
  },
  {
    id: "finding-the-same-neuron-twice",
    title: "Finding the Same Neuron Twice",
    subtitle: "Segmenting and matching cells between living and fixed brain tissue, with no alignment given",
    date: "2026-11-07",
    category: "Computer Vision",
    tags: ["computer vision", "segmentation", "registration", "microscopy", "kaggle"],
    featured: true,
    status: "Completed",
    cover: "/projects/neuron-matching/cover.jpg",
    stack: ["PyTorch", "Cellpose-SAM", "DINOv2", "DINOCell", "OpenCV", "LightGBM", "ICP"],
    summary:
      "How I segmented every neuron in two very different microscopy images of the same mouse brain and matched them one-to-one, why matching turned out to be a segmentation problem, and what leave-one-mouse-out validation taught me about trusting held-out scores.",
    content: `The same patch of mouse brain is imaged twice: once while the animal is alive, and again after the tissue is fixed and sectioned. Connecting the two images means finding **the same neuron in both**, cell by cell. This project does that automatically.

It was Question 5 of Project 2 in NYU's CS-GY 6643 (Computer Vision), run as a class Kaggle competition. We entered as a two-person team, and I built the pipeline end to end: segmentation, registration and matching.

@[animation](/projects/neuron-matching/pipeline.mp4 /projects/neuron-matching/pipeline-poster.jpg "The pipeline on one test region, redrawn as stylized cells from my predicted masks (no microscopy images)")

## Two pictures of the same tissue

Each sample is one brain region imaged two ways:

- **In-vivo:** a two-photon image of living cortex, about 600 × 600 px, grayscale. Cells are bright bodies on a hazy background of neuropil.
- **Ex-vivo:** a fluorescence image of the same tissue after fixation and sectioning, up to 1627 × 1627 px. It's sharper, but full of bright neuronal processes that look a lot like cells, and the in-vivo field covers only part of it.

The section isn't the same optical plane, and it's rotated and slightly scaled, so some regions share few visible cells. **No alignment is given.**

There were 3 training mice (47 region pairs) and 2 unseen test mice (29 pairs). The training labels hold 14,893 in-vivo cells, 5,516 ex-vivo cells and 1,139 annotated pairs.

## Matching is a segmentation problem

The score is:

\`\`\`
S = 0.25 · PQ(in-vivo) + 0.25 · PQ(ex-vivo) + 0.5 · F1(matching)
\`\`\`

PQ is panoptic quality, and it counts a mask only at **IoU above 0.75**. A pair counts only if it's an annotated pair and both of its masks also pass that test.

That last rule shapes everything. Matching is half the score, but on a cell about 10 px across, one pixel of outline error drops IoU below 0.75 and loses the pair. When I checked held-out results on the training mice, **79% of the missed pairs failed on a mask, not on the matching.**

## Segmentation: each model won one modality

I fine-tuned two models: **Cellpose-SAM**, and **DINOCell**, a DINOv2 ViT-B/8 backbone pretrained on 130k cell images with a Cellpose flow head.

- **In-vivo:** Cellpose-SAM was better held out (PQ 0.745 vs 0.704). Its biggest single gain came from the input: a **top-hat filtered image at 3× scale** took held-out PQ from 0.605 to 0.745. DINOCell still found cells it missed, so I kept every Cellpose-SAM mask and added DINOCell's confident extra cells: +0.004 PQ held out, +0.003 on Kaggle.
- **Ex-vivo:** DINOCell carried over to the unseen mice much better: 0.514 on Kaggle vs 0.493 for a U-Net. Cellpose-SAM transferred worst here.

Other tricks were smaller. Random-convolution augmentation for ex-vivo DINOCell added +0.018 PQ held out but only +0.002 on Kaggle. Flip test-time augmentation added +0.002 in-vivo, within noise. CLAHE and 2–3× upscaling are part of DINOCell's input; I never tested them on their own.

## Registration: align the constellations first

The course suggested MARCO, a learned image-matching network. It registered **0 of 28** training regions: a model trained on natural images doesn't transfer to two-photon microscopy versus histology.

So I registered using the cells themselves. The segmented cell centroids in each image form a constellation, and the task becomes finding the affine transform between two point clouds:

1. **Hough voting** over rotation × scale proposes candidate transforms.
2. **ICP** refines each candidate.
3. A **learned ranker** picks the best one.
4. A second pass uses each mouse's confidently registered regions as pose anchors.
5. A region with low confidence can **borrow** a transform that other segmentations of the same images agree on (+0.005 on Kaggle).

## Matching: one-to-one pairs

After registration, every in-vivo/ex-vivo cell pair within **9 px** becomes a candidate, described by **28 features**: distance, size, intensity, mask quality, registration confidence and neighbourhood consistency. A **gradient-boosted verifier** scores each candidate, and **Hungarian assignment** keeps one-to-one pairs.

A simple rule mattered too: regions with a registration probability **below 0.2 get no pairs at all**. Wrong pairs cost F1, so abstaining when the alignment is doubtful added +0.016 on Kaggle.

## Validating on mice I'd never seen

The test set is two unseen mice, and both the annotators' style and the image appearance vary by mouse. A random split leaks each mouse's look into training and rewards models that memorise mice, so I validated **leave-one-mouse-out**.

It changed decisions: the random split and leave-one-mouse-out picked different ex-vivo models. But even leave-one-mouse-out was optimistic. Ex-vivo ensembles that won held out (0.557) lost on Kaggle (0.513), so I learned to treat ex-vivo held-out gains under about **+0.015** as noise.

## What didn't work

- Ex-vivo ensembles and instance fusion
- A learned outline refiner, which cut pairs on Kaggle (0.468)
- Re-training DINOCell variants
- Rescuing registration from vessels, gradient fields or dense correlation
- Zero-shot models

The hardest limits were in the data. Six test regions can't be registered at all, because no image or cell evidence matches. And ex-vivo outline size depends on each mouse's annotator, where a 1-px difference decides whether IoU clears 0.75.

## A tempting trick that backfired

Calibrating one test mouse's outline size against the public leaderboard raised the public score to **0.549**. On the private leaderboard, the same submission fell to **0.473**. The final pipeline doesn't use it: it scored **0.531** on the public leaderboard and **0.548** under leave-one-mouse-out validation. Training ran on NYU's HPC cluster (NVIDIA A100 GPUs under Slurm).

## The takeaway

> Evaluate segmentation, registration and matching together. When the test subjects differ from the training ones, a better training-domain metric doesn't guarantee a better test score. Change one thing at a time, and don't tune on the public leaderboard.`
  },
  {
    id: "engineering-principles-for-reliable-systems",
    title: "Engineering Principles for Reliable Systems",
    date: "2026-06-30",
    category: "Software Engineering",
    tags: ["architecture", "reliability", "backend"],
    featured: true,
    summary:
      "A practical checklist I use to keep production systems stable while shipping features quickly.",
    content: `## Ownership and observability

Reliability is not an afterthought. It starts with clear ownership boundaries, deterministic release processes, and high-signal observability.

## Every change is an experiment

I treat every production change as an experiment: define success criteria, monitor impact, and include rollback readiness before merge.

## Intentional complexity

Simple systems with explicit contracts are easier to test and recover. Complexity should be intentional and documented.`
  },
  {
    id: "practical-seo-for-developer-portfolios",
    title: "Practical SEO for Developer Portfolios",
    date: "2026-06-25",
    category: "Web Development",
    tags: ["seo", "web", "portfolio"],
    featured: true,
    summary:
      "How to structure metadata, schema, robots, and sitemaps so search engines can crawl your site efficiently.",
    content: `## Semantic HTML first

Crawlability begins with semantic HTML and useful page text. Bots and users should both understand what each page is about.

## Layered metadata

Then add metadata in layers: title, description, canonical URL, Open Graph, Twitter cards, and structured data JSON-LD.

## Robots and sitemaps

Finally, provide robots.txt and sitemap.xml so discovery and indexing are straightforward for search engines.`
  }
];
