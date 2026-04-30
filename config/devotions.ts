import divineMercyImage from "@/app/assets/media/devotions/divine mercy.jpg";
import procession from "@/app/assets/media/devotions/procession.jpg";
import prayer from "@/app/assets/media/devotions/prayer.png";
import chaplet from "@/app/assets/media/devotions/chaplet.png";
import novena from "@/app/assets/media/devotions/novena.png";

// ---------------------------- Types ----------------------------

export interface DevotionPart {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export interface Devotion {
  id: string;
  title: string;
  description?: string;
  parts: DevotionPart[];
}

// ---------------------------- Devotions ----------------------------

export const devotions: Devotion[] = [
  {
    id: "the-divine-mercy-devotion",
    title: "The Divine Mercy Devotion",
    parts: [
      {
        id: "the-divine-mercy-image",
        title: "The Divine Mercy Image",
        description:
          "“Paint an image according to the patter you see, with the signature: Jesus, I trust in You” … (Diary 147). “By means of this image, I shall grant many graces to souls. It is to be a reminder of the demands of My mercy” … (Diary 742). “The two rays denote blood and water. The pale ray stands for Water, which makes souls righteous. The red ray stands for the Blood, which is life of souls… These two rays issued forth from the very depths of My tender mercy when my agonized Heart was opened by the lance on the Cross. These rays should shield souls from the wrath of My Father” … (Diary 299).",
        imageUrl: divineMercyImage.src,
      },
      {
        id: "the-feast-of-divine-mercy",
        title: "The Feast of Divine Mercy",
        description:
          "It is My desire that it be solemnly celebrated on the first Sunday after Easter. Mankind will not have peace until it turns to the fount of My Mercy” … (Diary 699). “The soul that will go to Confession and receive Holy Communion shall obtain complete forgiveness of sins and punishment” … (Diary 699) (Plenary Indulgence).",
        imageUrl: procession.src,
      },
      {
        id: "the-hour-of-great-mercy",
        title: "The Hour of Great Mercy",
        description:
          "At three o’clock, implore My mercy, specially for sinners, and, if only for a brief moment, immerse yourself in My passion, particularly in My abandonment at the moment of agony. This is the hour of great mercy for the whole world. I will allow you to enter My mortal sorrow. In this hour, I will refuse nothing to the soul that makes a request of Me in virtue of My passion” … (Diary 1320).",
        imageUrl: prayer.src,
      },
      {
        id: "the-chaplet-of-the-divine-mercy",
        title: "The Chaplet of the Divine Mercy",
        description:
          "Through this chaplet, you will obtain everything. If what you ask for is compatible to My will.” (Diary 1731). “When hardened sinners say it, I will fill their souls with peace, and the hour of their death will be a happy one.” (Diary 1541). “Even if there were sinner most hardened, if he were to recite this chaplet even once, he would receive grace from My infinite mercy.” … (Diary 687)",
        imageUrl: chaplet.src,
      },
      {
        id: "the-novena-to-the-divine-mercy",
        title: "The Novena to the Divine Mercy",
        description:
          "(St. Faustina Kowalska; the Lord told me to say this chaplet for nine days before the Feast of Mercy. It is to begin on Good Friday). “By this Novena, I will grant every possible grace to souls” … (Diary 769).",
        imageUrl: novena.src,
      },
    ],
  },
];
