import { useRef, useState, useEffect } from "react";

const getImageRatio = (img) => img.naturalWidth / img.naturalHeight;

export const Thumbnail = ({ src, style, className, children }) => {
  const containerRef = useRef(null);
  const [containerRatio, setContainerRatio] = useState(1);
  const [imageRatio, setImageRatio] = useState(1);

  useEffect(() => {
    const updateRatio = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerRatio(width / height || 1);
      }
    };
    updateRatio();
    window.addEventListener("resize", updateRatio);
    return () => window.removeEventListener("resize", updateRatio);
  }, []);

  useEffect(() => {
    if (!src) return;
    const img = new window.Image();
    img.onload = () => setImageRatio(getImageRatio(img));
    img.src = src;
  }, [src]);

  let objectFit = "cover";
  let objectPosition = "center";
  if (Math.abs(containerRatio - imageRatio) < 0.01) {
    objectFit = "cover";
  } else if (containerRatio > imageRatio) {
    objectFit = "cover";
    objectPosition = "center";
  } else {
    objectFit = "cover";
    objectPosition = "center";
  }

  return (
    <div
      ref={containerRef}
      className={`thumbnail ${className || ""}`}
      style={{ ...style, overflow: "hidden", position: "relative" }}
    >
      <img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit,
          objectPosition,
          display: "block",
        }}
        draggable={false}
      />
      { children }
    </div>
  );
};