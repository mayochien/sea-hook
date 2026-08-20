// 魚種知識小測驗的題庫，題目與答案皆取自 fishInfo.ts 內的魚種資料。
import type { FishQuizQuestion, RegionId } from "../types/fishing";
import type { FishEntry } from "./fishInfo";
import { fishEntries } from "./fishInfo";

export const regionLabels: Record<RegionId, string> = {
  north: "北部海域",
  west: "西部海域",
  east: "東部海域",
  south: "南部海域",
};

export const fishQuiz: FishQuizQuestion[] = [
  {
    id: "quiz-fish-01",
    question: "哪一種物種是暖水性洄游魚類，常在台灣東部、南部與離島外海活動？",
    options: [
      getFishEntry("01-G-027").name,
      getFishEntry("01-G-021").name,
      getFishEntry("02-Y-061").name,
      getFishEntry("03-R-086").name,
    ],
    answer: getFishEntry("01-G-027").name,
    explain: getFishEntry("01-G-027").note ?? "",
  },
  {
    id: "quiz-fish-02",
    question: "哪一種魚在台灣常被做成美味的一夜干？",
    options: [
      getFishEntry("01-G-018").name,
      getFishEntry("01-G-019").name,
      getFishEntry("01-G-021").name,
      getFishEntry("02-Y-050").name,
    ],
    answer: getFishEntry("01-G-018").name,
    explain: getFishEntry("01-G-018").note ?? "",
  },
  {
    id: "quiz-fish-03",
    question: "哪一種物種由雄魚的育兒袋孵育幼魚？",
    options: [
      getFishEntry("03-R-086").name,
      getFishEntry("02-Y-039").name,
      getFishEntry("01-G-012").name,
      getFishEntry("03-R-079").name,
    ],
    answer: getFishEntry("03-R-086").name,
    explain: getFishEntry("03-R-086").note ?? "",
  },
  {
    id: "quiz-fish-04",
    question: "哪一種物種會啃食珊瑚表面的藻類，並將珊瑚碎屑排出形成沙灘？",
    options: [
      getFishEntry("03-R-092").name,
      getFishEntry("03-R-093").name,
      getFishEntry("03-R-094").name,
      getFishEntry("03-R-095").name,
    ],
    answer: getFishEntry("03-R-092").name,
    explain: getFishEntry("03-R-092").note ?? "",
  },
  {
    id: "quiz-fish-05",
    question: "哪一種物種是軟骨魚類，且位於海洋食物鏈較高層？",
    options: [
      getFishEntry("03-R-077").name,
      getFishEntry("03-R-079").name,
      getFishEntry("02-Y-064").name,
      getFishEntry("02-Y-052").name,
    ],
    answer: getFishEntry("03-R-077").name,
    explain: getFishEntry("03-R-077").note ?? "",
  },
  {
    id: "quiz-fish-06",
    question: "哪一種物種會在海水與河川環境間洄游？",
    options: [
      getFishEntry("02-Y-061").name,
      getFishEntry("01-G-013").name,
      getFishEntry("02-Y-062").name,
      getFishEntry("01-G-028").name,
    ],
    answer: getFishEntry("02-Y-061").name,
    explain: getFishEntry("02-Y-061").note ?? "",
  },
  {
    id: "quiz-fish-07",
    question: "哪一種物種在台灣俗稱「煙管仔」、「竹棍魚」或「槍管煙」？",
    options: [
      getFishEntry("01-G-021").name,
      getFishEntry("01-G-023").name,
      getFishEntry("02-Y-057").name,
      getFishEntry("01-G-017").name,
    ],
    answer: getFishEntry("01-G-021").name,
    explain: getFishEntry("01-G-021").note ?? "",
  },
  {
    id: "quiz-fish-08",
    question: "哪一種物種又稱真鯛，體色銀白並帶有紅色斑點？",
    options: [
      getFishEntry("02-Y-052").name,
      getFishEntry("02-Y-051").name,
      getFishEntry("02-Y-047").name,
      getFishEntry("01-G-025").name,
    ],
    answer: getFishEntry("02-Y-052").name,
    explain: getFishEntry("02-Y-052").note ?? "",
  },
  {
    id: "quiz-fish-09",
    question: "哪一種物種屬於頭足類，遇到危險時會噴出墨汁逃生？",
    options: [
      getFishEntry("01-G-010").name,
      getFishEntry("02-Y-038").name,
      getFishEntry("02-Y-039").name,
      getFishEntry("02-Y-040").name,
    ],
    answer: getFishEntry("02-Y-038").name,
    explain: getFishEntry("02-Y-038").note ?? "",
  },
  {
    id: "quiz-fish-10",
    question: "哪一種物種會在每年 4 月至 7 月隨黑潮北上洄游？",
    options: [
      getFishEntry("01-G-012").name,
      getFishEntry("01-G-013").name,
      getFishEntry("01-G-021").name,
      getFishEntry("02-Y-052").name,
    ],
    answer: getFishEntry("01-G-012").name,
    explain: getFishEntry("01-G-012").note ?? "",
  },
];

function getFishEntry(id: string): FishEntry {
  const entry = fishEntries.find((item) => item.id === id);
  if (!entry) {
    throw new Error(`Missing fish entry: ${id}`);
  }
  return entry;
}
