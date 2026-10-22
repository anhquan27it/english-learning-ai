import type { Lesson } from "../../types";
import { say, show } from "../helpers";

// Phần 5 (Hòa hợp chủ ngữ – động từ) và Phần 6 (Cấu trúc nâng cao).

export const subjectVerbAgreement: Lesson = {
  id: "subject-verb-agreement",
  title: "Hòa hợp chủ ngữ – động từ",
  summary: "Each, everyone, the number of, neither…nor, danh từ tập hợp và các bẫy hay gặp.",
  level: "intermediate",
  emoji: "⚖️",
  minutes: 18,
  scenes: [
    {
      id: "s1",
      type: "slide",
      title: "Quy tắc cơ bản",
      blocks: [
        { id: "e1", kind: "example", en: "He runs every morning.", vi: "Chủ ngữ số ít → động từ số ít", highlight: ["runs"] },
        { id: "e2", kind: "example", en: "They run every morning.", vi: "Chủ ngữ số nhiều → động từ số nhiều", highlight: ["run"] },
        { id: "e3", kind: "example", en: "Tom and Jerry are friends.", vi: "A and B → số nhiều", highlight: ["are"] },
        { id: "note", kind: "text", tone: "note", text: "Ngoại lệ: **Bread and butter is** my favorite breakfast. (một món duy nhất)" },
      ],
      actions: [
        say("Hòa hợp chủ ngữ và động từ nghĩa là động từ phải phù hợp về số với chủ ngữ."),
        show("e1"),
        show("e2"),
        say("`He runs`, nhưng `They run`."),
        show("e3"),
        say("Hai chủ ngữ nối bằng `and` thì động từ chia số nhiều."),
        show("note"),
        say("Ngoại lệ là khi hai danh từ chỉ một thứ duy nhất, như `bread and butter` là một món ăn."),
      ],
    },
    {
      id: "s2",
      type: "slide",
      title: "Những trường hợp luôn số ít",
      blocks: [
        {
          id: "table",
          kind: "table",
          headers: ["Chủ ngữ", "Ví dụ"],
          rows: [
            ["each, every, everyone, nobody…", "Everyone **is** here."],
            ["Danh từ không đếm được", "Information **is** essential."],
            ["The number of + N", "The number of cars **has** risen."],
            ["One of + N số nhiều", "One of my friends **is** moving to Canada."],
            ["Tiền, thời gian, khoảng cách", "Ten dollars **is** not enough."],
            ["Môn -ics, news, tên riêng", "Mathematics **is** my favorite subject."],
          ],
        },
        { id: "c1", kind: "compare", wrong: "Each of the students have a laptop.", right: "Each of the students has a laptop.", note: "Chủ ngữ thật là “Each”" },
      ],
      actions: [
        show("table"),
        say("Những chủ ngữ sau đây luôn đi với động từ số ít: đại từ bất định như `everyone`, danh từ không đếm được, `the number of`, `one of`, lượng tiền và thời gian."),
        show("c1"),
        say("Đừng bị đánh lừa bởi danh từ số nhiều đứng gần động từ. Trong câu này, chủ ngữ thật là `each`, nên dùng `has`."),
      ],
    },
    {
      id: "s3",
      type: "slide",
      title: "Những cái bẫy",
      blocks: [
        { id: "c1", kind: "compare", wrong: "The quality of the products are improving.", right: "The quality of the products is improving.", note: "Bỏ qua cụm chen ngang “of the products”" },
        { id: "c2", kind: "compare", wrong: "There is many options.", right: "There are many options.", note: "There + be: chia theo danh từ phía sau" },
        { id: "c3", kind: "compare", wrong: "Either the teacher or the students has the answer.", right: "Either the teacher or the students have the answer.", note: "Either/Neither … or/nor: chia theo chủ ngữ gần nhất" },
        { id: "e1", kind: "example", en: "A number of students are absent today.", vi: "A number of = many → số nhiều", highlight: ["are"] },
      ],
      actions: [
        show("c1"),
        say("Bẫy thứ nhất: cụm chen ngang. Chủ ngữ chính là `the quality`, nên động từ là `is`."),
        show("c2"),
        say("Bẫy thứ hai: với `there`, động từ chia theo danh từ phía sau: `There are many options`."),
        show("c3"),
        say("Bẫy thứ ba: `either or` và `neither nor` chia theo chủ ngữ gần động từ nhất."),
        show("e1"),
        say("Và phân biệt: `the number of` là số ít, nhưng `a number of` nghĩa là nhiều, nên là số nhiều."),
      ],
    },
    {
      id: "q1",
      type: "sort",
      title: "Trò chơi: Số ít hay số nhiều?",
      intro: "Kéo mỗi chủ ngữ vào nhóm động từ phù hợp.",
      categories: [
        { id: "sg", label: "is / has (số ít)" },
        { id: "pl", label: "are / have (số nhiều)" },
      ],
      items: [
        { text: "Everyone", category: "sg" },
        { text: "The news", category: "sg" },
        { text: "The number of cars", category: "sg" },
        { text: "Mathematics", category: "sg" },
        { text: "Ten dollars", category: "sg" },
        { text: "A number of students", category: "pl" },
        { text: "The police", category: "pl" },
        { text: "Tom and Jerry", category: "pl" },
        { text: "Two-thirds of the students", category: "pl" },
      ],
    },
    {
      id: "q2",
      type: "quiz",
      title: "Câu đố hòa hợp",
      questions: [
        { q: "The number of accidents on this road ___ decreased.", options: ["has", "have"], answer: 0 },
        { q: "Neither the manager nor the employees ___ to work overtime.", options: ["want", "wants"], answer: 0 },
        { q: "One of my friends ___ moving to Canada.", options: ["is", "are"], answer: 0 },
        { q: "A pair of shoes ___ under the bed.", options: ["was", "were"], answer: 0 },
        { q: "The criteria for selection ___ clearly defined.", options: ["is", "are"], answer: 1, explain: "criteria là số nhiều của criterion." },
      ],
    },
    {
      id: "q3",
      type: "fix",
      title: "Viết lại câu cho đúng",
      items: [
        { wrong: "There is many reasons for his success.", answers: ["There are many reasons for his success."] },
        { wrong: "Everybody were excited about the trip.", answers: ["Everybody was excited about the trip."] },
        { wrong: "The news are spreading fast.", answers: ["The news is spreading fast."] },
        { wrong: "A lot of information are available online.", answers: ["A lot of information is available online."] },
      ],
    },
  ],
};

export const conditionals: Lesson = {
  id: "conditionals",
  title: "Câu điều kiện",
  summary: "Loại 0, 1, 2, 3, hỗn hợp, unless và đảo ngữ.",
  level: "intermediate",
  emoji: "🔀",
  minutes: 18,
  scenes: [
    {
      id: "s1",
      type: "slide",
      title: "Các loại câu điều kiện",
      blocks: [
        {
          id: "table",
          kind: "table",
          headers: ["Loại", "Cấu trúc", "Cách dùng"],
          rows: [
            ["0", "If + HTĐ, HTĐ", "Sự thật, quy luật"],
            ["1", "If + HTĐ, will + V", "Có thể xảy ra trong tương lai"],
            ["2", "If + QKĐ, would + V", "Không có thật ở hiện tại"],
            ["3", "If + QKHT, would have + V3", "Không có thật trong quá khứ"],
            ["Hỗn hợp", "If + QKHT, would + V", "Trái quá khứ → kết quả hiện tại"],
          ],
        },
      ],
      actions: [
        say("Câu điều kiện gồm hai phần: mệnh đề if nêu điều kiện, và mệnh đề chính nêu kết quả."),
        show("table"),
        say("Có năm loại chính. Loại không cho sự thật, loại một cho điều có thể xảy ra, loại hai cho điều không có thật ở hiện tại, loại ba cho điều không có thật trong quá khứ, và loại hỗn hợp."),
      ],
    },
    {
      id: "s2",
      type: "slide",
      title: "Ví dụ từng loại",
      blocks: [
        { id: "e0", kind: "example", en: "If you heat water to 100 degrees, it boils.", vi: "Loại 0 – quy luật tự nhiên" },
        { id: "e1", kind: "example", en: "If it rains tomorrow, we will cancel the picnic.", vi: "Loại 1" },
        { id: "e2", kind: "example", en: "If I were you, I would apply for that job.", vi: "Loại 2 – dùng were cho mọi chủ ngữ" },
        { id: "e3", kind: "example", en: "If she had studied harder, she would have passed the exam.", vi: "Loại 3" },
        { id: "em", kind: "example", en: "If he had taken the medicine, he would be feeling better now.", vi: "Hỗn hợp" },
      ],
      actions: [
        show("e0"),
        say("`If you heat water to 100 degrees, it boils.` Đây là sự thật, loại không."),
        show("e1"),
        say("`If it rains tomorrow, we will cancel the picnic.` Có thể xảy ra, loại một."),
        show("e2"),
        say("`If I were you, I would apply for that job.` Tôi không phải là bạn, nên đây là loại hai. Chú ý dùng `were` cho mọi chủ ngữ."),
        show("e3"),
        say("`If she had studied harder, she would have passed the exam.` Chuyện đã qua, không thể thay đổi, loại ba."),
        show("em"),
      ],
    },
    {
      id: "s3",
      type: "slide",
      title: "Lưu ý quan trọng",
      blocks: [
        { id: "c1", kind: "compare", wrong: "If it will rain, we will stay inside.", right: "If it rains, we will stay inside.", note: "Không dùng will trong mệnh đề If" },
        { id: "e1", kind: "example", en: "Unless you hurry, you will miss the bus.", vi: "= If you don't hurry, …" },
        { id: "tip", kind: "text", tone: "tip", text: "Đảo ngữ trang trọng: **Should you need** help, … / **Had she studied** harder, …" },
      ],
      actions: [
        show("c1"),
        say("Không dùng `will` trong mệnh đề if."),
        show("e1"),
        say("`Unless` nghĩa là nếu không."),
        show("tip"),
        say("Để bài viết trang trọng hơn, bạn có thể dùng đảo ngữ: `Had she studied harder`, thay cho `If she had studied harder`."),
      ],
    },
    {
      id: "q1",
      type: "match",
      title: "Ghép mệnh đề If với kết quả",
      pairs: [
        { left: "If you mix red and blue,", right: "you get purple." },
        { left: "If it is sunny tomorrow,", right: "we will go to the beach." },
        { left: "If I had more time,", right: "I would travel more." },
        { left: "If they had left earlier,", right: "they wouldn't have missed the flight." },
      ],
    },
    {
      id: "q2",
      type: "fill",
      title: "Chia động từ",
      items: [
        { sentence: "If you ___ red and blue, you get purple. (mix)", answers: ["mix"] },
        { sentence: "If she ___ more time, she would travel more. (have)", answers: ["had"] },
        { sentence: "If they had left earlier, they ___ the flight. (not/miss)", answers: ["would not have missed", "wouldn't have missed"] },
        { sentence: "If it ___ sunny tomorrow, we will go to the beach. (be)", answers: ["is"] },
      ],
    },
    {
      id: "q3",
      type: "quiz",
      title: "Câu đố điều kiện",
      questions: [
        { q: "If I ___ you, I would accept the offer.", options: ["am", "were", "will be"], answer: 1 },
        { q: "I will go out ___ it rains.", options: ["unless", "if not", "without"], answer: 0 },
        { q: "___ she studied harder, she would have passed.", options: ["Should", "Had", "Were"], answer: 1, explain: "Đảo ngữ loại 3: Had + S + V3." },
      ],
    },
  ],
};

export const passiveModals: Lesson = {
  id: "passive-modals",
  title: "Câu bị động & động từ khuyết thiếu",
  summary: "be + V3 ở mọi thì; can, must, should; must have / should have + V3.",
  level: "advanced",
  emoji: "🎓",
  minutes: 20,
  scenes: [
    {
      id: "s1",
      type: "slide",
      title: "Câu bị động",
      subtitle: "Passive Voice",
      blocks: [
        { id: "f1", kind: "formula", parts: ["Object", "+", "be (chia thì)", "+", "V3", "+", "(by…)"] },
        { id: "e1", kind: "example", en: "The chef cooks the meal.", vi: "Chủ động" },
        { id: "e2", kind: "example", en: "The meal is cooked by the chef.", vi: "Bị động", highlight: ["is cooked"] },
        { id: "note", kind: "text", tone: "note", text: "Không cần “by…” khi chủ thể không quan trọng: My bike **was stolen**." },
      ],
      actions: [
        say("Câu bị động nhấn mạnh đối tượng chịu tác động, thay vì người thực hiện hành động."),
        show("f1"),
        show("e1"),
        show("e2"),
        say("`The chef cooks the meal` chuyển thành `The meal is cooked by the chef`."),
        show("note"),
        say("Nhiều khi không cần `by` cộng chủ thể, ví dụ `My bike was stolen`, vì ta không biết ai lấy."),
      ],
    },
    {
      id: "s2",
      type: "slide",
      title: "Bị động theo từng thì",
      blocks: [
        {
          id: "table",
          kind: "table",
          headers: ["Thì", "Cấu trúc", "Ví dụ"],
          rows: [
            ["Hiện tại đơn", "is/am/are + V3", "English is spoken worldwide."],
            ["Hiện tại tiếp diễn", "is/are + being + V3", "The road is being repaired."],
            ["Quá khứ đơn", "was/were + V3", "The bridge was built in 1990."],
            ["Hiện tại hoàn thành", "has/have + been + V3", "The report has been finished."],
            ["Tương lai đơn", "will + be + V3", "The results will be announced tomorrow."],
            ["Modal", "modal + be + V3", "The problem must be solved quickly."],
          ],
        },
        { id: "c1", kind: "compare", wrong: "The accident was happened.", right: "The accident happened.", note: "Nội động từ không có bị động" },
      ],
      actions: [
        show("table"),
        say("Chỉ cần chia động từ `be` theo thì, rồi thêm quá khứ phân từ. Ví dụ `The report has been finished.`"),
        show("c1"),
        say("Lưu ý: động từ không có tân ngữ như `happen` không chuyển sang bị động được."),
      ],
    },
    {
      id: "s3",
      type: "slide",
      title: "Động từ khuyết thiếu",
      subtitle: "Modal verbs",
      blocks: [
        {
          id: "cards",
          kind: "cards",
          items: [
            { icon: "💪", title: "can / could", text: "Khả năng, xin phép: She can play the piano." },
            { icon: "🌦️", title: "may / might", text: "Có thể (khả năng thấp): It might rain later." },
            { icon: "❗", title: "must", text: "Phải; chắc hẳn: You must finish your homework." },
            { icon: "💡", title: "should", text: "Nên: You should see a doctor." },
          ],
        },
        { id: "f1", kind: "formula", label: "Modal perfect", parts: ["Modal", "+", "have", "+", "V3"] },
        {
          id: "table",
          kind: "table",
          headers: ["Cấu trúc", "Nghĩa", "Ví dụ"],
          rows: [
            ["must have + V3", "Chắc hẳn đã", "He must have missed the train."],
            ["should have + V3", "Lẽ ra nên", "You should have told me earlier."],
            ["could have + V3", "Đã có thể…", "They could have helped us."],
            ["can't have + V3", "Không thể nào đã", "She can't have finished already."],
          ],
        },
      ],
      actions: [
        show("cards"),
        say("Động từ khuyết thiếu diễn tả khả năng, nghĩa vụ, lời khuyên. Sau chúng luôn là động từ nguyên thể không `to`."),
        show("f1"),
        show("table"),
        say("Khi nói về quá khứ, ta dùng modal cộng `have` cộng V3. `He must have missed the train`, anh ấy chắc hẳn đã lỡ tàu. `You should have told me earlier`, lẽ ra bạn nên nói với tôi sớm hơn."),
      ],
    },
    {
      id: "q1",
      type: "fix",
      title: "Chuyển sang bị động",
      intro: "Viết lại câu ở dạng bị động.",
      items: [
        { wrong: "People speak English all over the world.", answers: ["English is spoken all over the world."] },
        { wrong: "The company has launched a new product.", answers: ["A new product has been launched by the company.", "A new product has been launched."] },
        { wrong: "They will announce the results next week.", answers: ["The results will be announced next week."] },
      ],
    },
    {
      id: "q2",
      type: "fill",
      title: "Modal perfect",
      items: [
        { sentence: "The ground is wet. It ___ last night. (rain)", answers: ["must have rained"] },
        { sentence: "You failed the test. You ___ harder. (study)", answers: ["should have studied"] },
        { sentence: "She ___ already; she only started an hour ago. (finish)", answers: ["can't have finished", "cannot have finished"] },
      ],
    },
    {
      id: "q3",
      type: "quiz",
      title: "Câu đố tổng hợp",
      questions: [
        { q: "The bridge ___ in 1990.", options: ["built", "was built", "has built"], answer: 1 },
        { q: "The road ___ at the moment.", options: ["is repaired", "is being repaired", "repairs"], answer: 1 },
        { q: "She must ___ now.", options: ["go", "goes", "to go"], answer: 0 },
        { q: "Mức độ chắc chắn cao nhất là:", options: ["might", "should", "must"], answer: 2 },
      ],
    },
  ],
};
