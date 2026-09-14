/**
 * The supplied 如意云 motifs, moving at separate depths.
 *
 * They are DOM images rather than a canvas so they stay sharp at any display
 * density. Scroll provides the long parallax; the pointer adds a smaller,
 * slower shift that makes the field feel spatial without becoming a demo.
 */

const CLOUDS = [
  { image: 1, x: 10, y: 14, width: 210, depth: 0.18, opacity: 0.24, drift: 1 },
  { image: 8, x: 76, y: 9, width: 300, depth: 0.1, opacity: 0.17, drift: -1 },
  { image: 3, x: 94, y: 30, width: 230, depth: 0.28, opacity: 0.3, drift: 1 },
  { image: 5, x: 36, y: 50, width: 170, depth: 0.36, opacity: 0.34, drift: -1 },
  { image: 6, x: 72, y: 68, width: 225, depth: 0.22, opacity: 0.24, drift: 1 },
  { image: 4, x: 4, y: 82, width: 285, depth: 0.12, opacity: 0.18, drift: -1 },
  { image: 9, x: 54, y: 27, width: 130, depth: 0.46, opacity: 0.37, drift: 1 },
  { image: 2, x: 106, y: 88, width: 260, depth: 0.16, opacity: 0.19, drift: -1 },
  { image: 7, x: 19, y: 34, width: 145, depth: 0.42, opacity: 0.31, drift: -1 },
  { image: 1, x: 85, y: 52, width: 175, depth: 0.34, opacity: 0.27, drift: 1 },
  { image: 3, x: 48, y: 78, width: 300, depth: 0.08, opacity: 0.14, drift: -1 },
  { image: 6, x: 22, y: 93, width: 190, depth: 0.3, opacity: 0.25, drift: 1 },
  { image: 8, x: 4, y: 116, width: 260, depth: 0.2, opacity: 0.2, drift: 1 },
  { image: 2, x: 63, y: 112, width: 185, depth: 0.4, opacity: 0.3, drift: -1 },
  { image: 7, x: 80, y: 137, width: 270, depth: 0.32, opacity: 0.24, drift: -1 },
];

export function createCloudField(host, { reducedMotion = false } = {}) {
  const layer = host.querySelector(".cloud-layer") ?? host;
  const nodes = CLOUDS.map((cloud, i) => {
    const image = document.createElement("img");
    image.className = "parallax-cloud";
    image.src = `assets/clouds/cloud-${cloud.image}.png`;
    image.alt = "";
    image.dataset.cloud = String(i + 1);
    image.decoding = "async";
    image.fetchPriority = i < 3 ? "high" : "low";
    image.style.width = `${cloud.width}px`;
    image.style.opacity = String(cloud.opacity);
    layer.append(image);
    return { ...cloud, element: image };
  });

  let scroll = 0;
  let pointerX = 0;
  let pointerY = 0;
  let targetX = 0;
  let targetY = 0;
  let frameId = 0;

  function render(time = 0) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    pointerX += (targetX - pointerX) * 0.045;
    pointerY += (targetY - pointerY) * 0.045;

    for (const [i, cloud] of nodes.entries()) {
      const sway = reducedMotion ? 0 : Math.sin(time * 0.0003 + i * 1.7) * 24 * cloud.depth;
      const rise = reducedMotion ? 0 : Math.cos(time * 0.00024 + i * 2.1) * 14 * cloud.depth;
      const x = (cloud.x / 100) * width + pointerX * 72 * cloud.depth + sway * cloud.drift;
      const y =
        (cloud.y / 100) * height -
        scroll * height * (0.35 + cloud.depth * 1.2) +
        pointerY * 42 * cloud.depth +
        rise;
      const scale = 0.78 + cloud.depth * 0.55;
      cloud.element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
    }

    if (!reducedMotion) frameId = requestAnimationFrame(render);
  }

  function onPointer(event) {
    targetX = event.clientX / window.innerWidth - 0.5;
    targetY = event.clientY / window.innerHeight - 0.5;
  }

  if (!reducedMotion) window.addEventListener("pointermove", onPointer, { passive: true });
  render();

  return {
    setScroll(value) {
      scroll = value;
      if (reducedMotion) render();
    },
    setFormation(name) {
      host.dataset.formation = name;
    },
    ignite() {},
    cool() {},
    destroy() {
      cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", onPointer);
    },
  };
}
