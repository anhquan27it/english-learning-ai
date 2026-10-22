import type { Lesson } from "../../types";
import { conditionals, passiveModals, subjectVerbAgreement } from "./advanced";
import { clauses, sentenceTypes } from "./sentences";
import { pastFutureTenses, presentTenses } from "./tenses";
import { commonWordErrors, partsOfSpeech, wordFormation } from "./words";

// Thứ tự học đề xuất: từ dễ đến khó.
export const grammarLessons: Lesson[] = [
  partsOfSpeech,
  commonWordErrors,
  presentTenses,
  sentenceTypes,
  wordFormation,
  pastFutureTenses,
  subjectVerbAgreement,
  clauses,
  conditionals,
  passiveModals,
];
