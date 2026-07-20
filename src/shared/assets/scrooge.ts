export type TScroogeImageKey = "classic" | "cute" | "comics" | "vault" | "group" | "about";

export const SCROOGE_IMAGES: Record<TScroogeImageKey, string> = {
  classic: "/assets/scrooge/scrooge-classic.png",
  cute: "/assets/scrooge/scrooge-cute.png",
  comics: "/assets/scrooge/scrooge-comics.png",
  vault: "/assets/scrooge/scrooge-vault.png",
  group: "/assets/scrooge/vault-group.png",
  about: "/assets/scrooge/scrooge-about.png"
};

export const pickScroogeImage = (key: TScroogeImageKey): string => SCROOGE_IMAGES[key];
