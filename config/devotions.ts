import divineMercyImage from "@/app/assets/media/devotions/divine mercy.jpg";
import procession from "@/app/assets/media/devotions/procession.jpg";
import prayer from "@/app/assets/media/devotions/prayer.png";
import chaplet from "@/app/assets/media/devotions/chaplet.png";
import novena from "@/app/assets/media/devotions/novena.png";
import faustinaImage from "@/app/assets/media/devotions/faustina.webp";
import {
  Church,
  GraduationCap,
  MapPin,
  Users,
  type LucideIcon,
} from "lucide-react";

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
          "“Paint an image according to the patter you see, with the signature: Jesus, I trust in You” … (Diary 147). “By means of this image, I shall grant many graces to souls. It is to be a reminder of the demands of My mercy” … (Diary 742). “The two rays denote blood and water. The pale ray stands for Water, which makes souls righteous. The red ray stands for the Blood, which is life of souls… These two rays issued forth from the very depths of my tender mercy when my agonized heart was opened by the lance on the Cross. These rays should shield souls from the wrath of my Father” … (Diary 299).",
        imageUrl: divineMercyImage.src,
      },
      {
        id: "the-feast-of-divine-mercy",
        title: "The Feast of Divine Mercy",
        description:
          "It is my desire that it be solemnly celebrated on the first Sunday after Easter. Mankind will not have peace until it turns to the fount of My Mercy” … (Diary 699). “The soul that will go to Confession and receive Holy Communion shall obtain complete forgiveness of sins and punishment” … (Diary 699) (Plenary Indulgence).",
        imageUrl: procession.src,
      },
      {
        id: "the-hour-of-great-mercy",
        title: "The Hour of Great Mercy",
        description:
          "At three o’clock, implore my mercy, specially for sinners, and, if only for a brief moment, immerse yourself in my passion, particularly in my abandonment at the moment of agony. This is the hour of great mercy for the whole world. I will allow you to enter my mortal sorrow. In this hour, I will refuse nothing to the soul that makes a request of me in virtue of my passion” … (Diary 1320).",
        imageUrl: prayer.src,
      },
      {
        id: "the-chaplet-of-the-divine-mercy",
        title: "The Chaplet of the Divine Mercy",
        description:
          "Through this chaplet, you will obtain everything. If what you ask for is compatible to My will.” (Diary 1731). “When hardened sinners say it, I will fill their souls with peace, and the hour of their death will be a happy one.” (Diary 1541). “Even if there were sinner most hardened, if he were to recite this chaplet even once, he would receive grace from my infinite mercy.” … (Diary 687)",
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

// ---------------------------- ABC of Mercy ----------------------------

export interface AbcOfMercyItem {
  letter: string;
  title: string;
  description: string;
}

export const abcOfMercyHeader = {
  badge: "ABC's of Mercy",
  title: "The Message of Mercy",
};

export const abcOfMercy: AbcOfMercyItem[] = [
  {
    letter: "A",
    title: "ASK FOR HIS MERCY",
    description:
      "God wants us to approach Him in prayer constantly, repenting for our sins and asking Him to pour His mercy out upon us and upon the whole world.",
  },
  {
    letter: "B",
    title: "BE MERCIFUL",
    description:
      "God wants us to receive his mercy and let it flow through us to others. He wants us to extend love and forgiveness to others just as He does to us.",
  },
  {
    letter: "C",
    title: "COMPLETELY TRUST IN JESUS",
    description:
      "God wants us to know that the graces of His mercy are dependent upon our trust. The more we trust in Jesus, the more we will receive.",
  },
];

// ---------------------------- History of Divine Mercy ----------------------------

export const devotionsHistoryHeader = {
  badge: "The History",
  title: "The History of Divine Mercy",
  description:
    "A journey of revelation, devotion, and faith — from the convent in Vilnius to the universal Church.",
};

export interface FaustinaInfoItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const faustinaProfile = {
  image: faustinaImage,
  name: "St. Maria Faustina",
  role: "The Apostle of Mercy",
  quote: "Known for her prayer, heroic obedience, and profound humility.",
  info: [
    {
      icon: MapPin,
      title: "Origins",
      description: "Born Helena Kowalska, August 25, 1905, in Poland.",
    },
    {
      icon: Users,
      title: "Family",
      description: "The 3rd of 10 children in a poor, devout peasant family.",
    },
    {
      icon: GraduationCap,
      title: "Education",
      description: "Completed only three years of basic schooling.",
    },
    {
      icon: Church,
      title: "Calling",
      description: "Felt a call at age 7; entered the convent at age 20.",
    },
  ] satisfies FaustinaInfoItem[],
};

export interface DevotionHistoryItem {
  date: string;
  year: string;
  title?: string;
  description: string;
  quote?: string;
}

export const devotionsHistory: DevotionHistoryItem[] = [
  {
    date: "February 22, 1931",
    year: "1931",
    title: "How it began",
    description:
      "Jesus appeared in a vision to a young Polish nun, Sis. Maria Faustina Kowalska inside a convent in Vilnius, Poland.",
    quote:
      "“Tell the whole world about my mercy; that whoever approaches the Fount of Life on this day will be granted complete remission of sins and punishment. Mankind will not have peace until it turns with trust to my mercy.” Diary 699.",
  },
  {
    date: "June 1934",
    year: "1934",
    title: "The First Image",
    description:
      "The first Divine Mercy image was completed under Sis. Faustina’s directions; she wept in disappointment and complained to Jesus.",
    quote: "“Who will paint you as beautiful as you are?” Diary 313.",
  },
  {
    date: "July 1934",
    year: "1934",
    title: "Secretary and Apostle of Mercy",
    description:
      "Sis. Faustina started to keep a diary; about 600 pages recording the revelations she received about God’s mercy, titled ‘Divine Mercy in my Soul’.",
  },
  {
    date: "October 5, 1938",
    year: "1938",
    title: "Her Earthly Mission Ends",
    description: "Sis. Faustina died at the age of 33 from tuberculosis.",
    quote:
      "“I feel certain that my mission will not come to an end upon my death but will begin… I will draw aside for you the veils of heaven to convince you of God’s goodness.” Diary 281.",
  },
  {
    date: "1934-1941",
    year: "1934",
    title: "God’s Enormous Love for Poland",
    description:
      "Divine Mercy message spreads first among the victims of World War II. Under attack then, all of Poland suffered destruction except in Vilnius and Krakow where the Divine Mercy was first made known.",
  },
  {
    date: "March 6, 1959",
    year: "1959",
    title: "The Vatican Ban",
    description: "Vatican issued a notification banning Divine Mercy devotion.",
  },
  {
    date: "1965-1967",
    year: "1965",
    title: "The Informative Process",
    description:
      "Karol Wojtyla, an Archbishop of Krakow, led the informative process to validate revelations of the Divine Mercy, and the virtues and life of Sis. Faustina.",
  },
  {
    date: "April 15, 1978",
    year: "1978",
    title: "The Ban Lifted",
    description:
      "Based on the results of the informative process, the Vatican lifted the ban on Divine Mercy.",
  },
  {
    date: "October 16, 1978",
    year: "1978",
    title: "Pope John Paul II",
    description: "Cardinal Karol Wojtyla became Pope John Paul II.",
  },
  {
    date: "April 18, 1993 (2nd Sunday of Easter)",
    year: "1993",
    title: "Beatification of Sis. Faustina",
    description: "Sis. Faustina was beatified.",
  },
  {
    date: "April 30, 2000",
    year: "2000",
    title: "Canonization of Blessed Faustina",
    description:
      "Blessed Faustina was canonized in Rome; Divine Mercy Sunday was proclaimed.",
  },
  {
    date: "September 8, 2008",
    year: "2008",
    title: "Beatification of Fr. Michael Sopocko",
    description:
      "Fr. Michael Sopocko was beatified; the extra ordinary Polish priest, confessor and spiritual guide to Sis. Faustina Kowalska; known as the “only priest who believed Sis. Faustina”.",
  },
  {
    date: "May 1, 2011 (Feast of Mercy)",
    year: "2011",
    title: "Beatification of Pope John Paul II",
    description: "Pope John Paul II was beatified.",
  },
  {
    date: "April 27, 2014 (Feast of Mercy)",
    year: "2014",
    title: "Canonization of Pope John Paul II",
    description: "Pope John Paul was canonized.",
    quote:
      "“From Poland will come forth the SPARK that would prepare the world for My final coming.” Diary 1732",
  },
];
