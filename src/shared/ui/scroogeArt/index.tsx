import { motion } from "framer-motion";
import cn from "classnames";

import { pickScroogeImage, type TScroogeImageKey } from "@/shared/assets/scrooge";
import { easeOut } from "@/shared/lib/motion/presets";

import styles from "./index.module.scss";

interface IScroogeArtProps {
  variant?: TScroogeImageKey;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  animate?: boolean;
  alt?: string;
}

export const ScroogeArt = ({
  variant = "classic",
  size = "md",
  className,
  animate = false,
  alt = "Scrooge McDuck"
}: IScroogeArtProps) => {
  const content = (
    <img alt={alt} className={styles.image} draggable={false} src={pickScroogeImage(variant)} />
  );

  if (!animate) {
    return <div className={cn(styles.imageWrap, styles[size], className)}>{content}</div>;
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn(styles.imageWrap, styles[size], className)}
      initial={{ opacity: 0, y: 6 }}
      transition={easeOut}
    >
      {content}
    </motion.div>
  );
};
