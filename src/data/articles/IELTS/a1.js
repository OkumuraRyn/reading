// src/data/articles/IELTSGuide/a1.js
export default {
  id: "IELTS-GUIDE-1",
  type: "IELTS指南",
  title: "IELTS Practice Tests - Introduction",
  titleCn: "雅思考试实践测试 - 导言",
  paragraphs: [
    {
      type: "text",
      sentences: [
        { en: "The International English Language Testing System (IELTS) is widely recognised as a reliable means of assessing whether candidates are ready to study or train in the medium of English.", cn: "国际英语语言测试系统（IELTS）被广泛认为是评估考生是否准备好以英语为媒介进行学习或培训的可靠手段。" },
        { en: "These Practice Tests are designed to give future IELTS candidates an idea of whether their English is at the required level.", cn: "这些实践测试旨在让未来的雅思考生了解他们的英语水平是否达到要求。" }
      ]
    },
    {
      type: "text",
      sentences: [
        { en: "IELTS is owned by three partners, the University of Cambridge ESOL Examinations, the British Council and IDP Education Australia (through its subsidiary company, IELTS Australia Pty Limited).", cn: "雅思考试由三个合作伙伴共同拥有：剑桥大学ESOL考试委员会、英国文化协会和澳大利亚IDP教育（通过其子公司IELTS Australia Pty Limited）。" }
      ]
    },
    {
      type: "text",
      sentences: [
        { en: "Further information on IELTS can be found in the IELTS Handbook, available free of charge from IELTS centres.", cn: "有关雅思考试的更多信息可在《雅思手册》中找到，可从各雅思考试中心免费获取。" }
      ]
    },
    { type: "heading", level: 2, text: "WHAT IS THE TEST FORMAT?" },
    {
      type: "text",
      sentences: [
        { en: "IELTS consists of six modules. All candidates take the same Listening and Speaking modules. There is a choice of Reading and Writing modules according to whether a candidate is taking the Academic or General Training version of the test.", cn: "雅思考试由六个模块组成。所有考生参加相同的听力和口语模块。根据考生参加的是学术类还是培训类考试，可以选择不同的阅读和写作模块。" }
      ]
    },
    // 使用表格显示 Academic 和 General Training 对比
    {
      type: "table",
      headers: ["Academic", "General Training"],
      rows: [
        ["For candidates taking the test for entry to undergraduate or postgraduate studies or for professional reasons.", "For candidates taking the test for entry to vocational or training programmes not at degree level, for admission to secondary schools and for immigration purposes."]
      ]
    },
    {
      type: "text",
      sentences: [
        { en: "The test modules are taken in the following order:", cn: "考试模块按以下顺序进行：" }
      ]
    },
    // 使用表格显示各模块详情
    {
      type: "table",
      headers: ["Module", "Details", "Time"],
      rows: [
        ["Listening", "4 sections, 40 items", "30 minutes"],
        ["Academic Reading / General Training Reading", "3 sections, 40 items", "60 minutes"],
        ["Academic Writing / General Training Writing", "2 tasks", "60 minutes"],
        ["Speaking", "3 parts", "11-14 minutes"],
        ["Total", "", "2 hours 44 minutes"]
      ]
    },
    { type: "heading", level: 2, text: "Listening" },
    {
      type: "text",
      sentences: [
        { en: "This module consists of four sections, each with 10 questions. The first two sections are concerned with social needs. There is a conversation between two speakers and then a monologue. The final two sections are concerned with situations related to educational or training contexts. There is a conversation between up to four people and then a monologue.", cn: "该模块由四个部分组成，每个部分有10个问题。前两个部分涉及社交需求。首先是一段两人对话，然后是一段独白。最后两个部分涉及与教育或培训背景相关的情境。首先是一段最多四人的对话，然后是一段独白。" }
      ]
    },
    {
      type: "text",
      sentences: [
        { en: "A variety of question types is used, including: multiple choice, short-answer questions, sentence completion, notes/form/table/summary/flow-chart/timetable completion, labelling a diagram/plan/map, classification, matching.", cn: "使用多种题型，包括：多项选择题、简答题、句子完成题、笔记/表格/摘要/流程图/时间表完成题、图表/平面图/地图标记题、分类题、匹配题。" }
      ]
    },
    {
      type: "text",
      sentences: [
        { en: "Candidates hear the recording once only and answer the questions as they listen. Ten minutes are allowed at the end for candidates to transfer their answers to the answer sheet.", cn: "考生只听一遍录音，边听边答题。最后有十分钟时间让考生将答案誊写到答题纸上。" }
      ]
    },
    { type: "heading", level: 2, text: "Academic Reading" },
    {
      type: "text",
      sentences: [
        { en: "This module consists of three sections with 40 questions. There are three reading passages, which are taken from magazines, journals, books and newspapers. The passages are on topics of general interest. At least one text contains detailed logical argument.", cn: "该模块由三个部分组成，共40个问题。有三篇阅读文章，选自杂志、期刊、书籍和报纸。文章主题为普遍感兴趣的话题。至少有一篇文章包含详细的逻辑论证。" }
      ]
    },
    {
      type: "text",
      sentences: [
        { en: "A variety of question types is used, including: multiple choice, short-answer questions, sentence completion, notes/summary/flow-chart/table completion, labelling a diagram, classification, matching, choosing suitable paragraph headings from a list, identification of writer's views/claims – yes, no, not given – or identification of information in the text – true, false, not given.", cn: "使用多种题型，包括：多项选择题、简答题、句子完成题、笔记/摘要/流程图/表格完成题、图表标记题、分类题、匹配题、从列表中选合适的段落标题、识别作者观点/主张——是/否/未提及——或识别文中信息——对/错/未提及。" }
      ]
    },
    { type: "heading", level: 2, text: "General Training Reading" },
    {
      type: "text",
      sentences: [
        { en: "This module consists of three sections with 40 questions. The texts are taken from notices, advertisements, leaflets, newspapers, instruction manuals, books and magazines. The first section contains texts relevant to basic linguistic survival in English, with tasks mainly concerned with providing factual information. The second section focuses on the training context and involves texts of more complex language. The third section involves reading more extended texts, with a more complex structure, but with the emphasis on descriptive and instructive rather than argumentative texts.", cn: "该模块由三个部分组成，共40个问题。文本选自通知、广告、传单、报纸、说明书、书籍和杂志。第一部分包含与英语基本语言生存相关的文本，任务主要涉及提供事实信息。第二部分侧重于培训背景，涉及语言更复杂的文本。第三部分涉及阅读更长的文本，结构更复杂，但重点是描述性和指导性文本，而非议论文。" }
      ]
    },
    { type: "heading", level: 2, text: "Academic Writing" },
    {
      type: "text",
      sentences: [
        { en: "This module consists of two tasks. It is suggested that candidates spend about 20 minutes on Task 1, which requires them to write at least 150 words, and 40 minutes on Task 2, which requires them to write at least 250 words. The assessment of Task 2 carries more weight in marking than Task 1.", cn: "该模块由两部分组成。建议考生用约20分钟完成第一部分，要求至少写150词；用40分钟完成第二部分，要求至少写250词。第二部分在评分中比第一部分权重更高。" }
      ]
    },
    {
      type: "text",
      sentences: [
        { en: "Task 1 requires candidates to look at a diagram or some data (graph, table or chart) and to present the information in their own words. They may be assessed on their ability to organise, present and possibly compare data, describe the stages of a process, describe an object or event, or explain how something works.", cn: "第一部分要求考生查看图表或数据（曲线图、表格或饼图），并用自己的话呈现信息。评估内容包括组织、呈现和可能比较数据的能力，描述过程的阶段，描述物体或事件，或解释某事物的运作方式。" }
      ]
    },
    {
      type: "text",
      sentences: [
        { en: "In Task 2 candidates are presented with a point of view, argument or problem. They are assessed on their ability to present a solution to the problem, present and justify an opinion, compare and contrast evidence and opinions, and evaluate and challenge ideas, evidence or arguments.", cn: "在第二部分中，考生会看到一个观点、论点或问题。评估内容包括提出解决方案的能力、提出并论证观点的能力、比较和对比证据与观点的能力，以及评估和挑战想法、证据或论点的能力。" }
      ]
    },
    {
      type: "text",
      sentences: [
        { en: "Candidates are also assessed on their ability to write in an appropriate style.", cn: "考生撰写恰当文体的能力也会被评估。" }
      ]
    },
    { type: "heading", level: 2, text: "General Training Writing" },
    {
      type: "text",
      sentences: [
        { en: "This module consists of two tasks. It is suggested that candidates spend about 20 minutes on Task 1, which requires them to write at least 150 words, and 40 minutes on Task 2, which requires them to write at least 250 words. The assessment of Task 2 carries more weight in marking than Task 1.", cn: "该模块由两部分组成。建议考生用约20分钟完成第一部分，要求至少写150词；用40分钟完成第二部分，要求至少写250词。第二部分在评分中比第一部分权重更高。" }
      ]
    },
    {
      type: "text",
      sentences: [
        { en: "In Task 1 candidates are asked to respond to a given problem with a letter requesting information or explaining a situation. They are assessed on their ability to engage in personal correspondence, elicit and provide general factual information, express needs, wants, likes and dislikes, and express opinions, complaints, etc.", cn: "在第一部分中，考生需要针对特定问题写一封信，索取信息或解释情况。评估内容包括进行个人通信的能力、获取和提供一般事实信息的能力、表达需求、愿望、喜好与厌恶的能力，以及表达意见、抱怨等的能力。" }
      ]
    },
    {
      type: "text",
      sentences: [
        { en: "In Task 2 candidates are presented with a point of view, argument or problem. They are assessed on their ability to provide general factual information, outline a problem and present a solution, present and justify an opinion, and evaluate and challenge ideas, evidence or arguments.", cn: "在第二部分中，考生会看到一个观点、论点或问题。评估内容包括提供一般事实信息的能力、概述问题并提出解决方案的能力、提出并论证观点的能力，以及评估和挑战想法、证据或论点的能力。" }
      ]
    },
    {
      type: "text",
      sentences: [
        { en: "Candidates are also assessed on their ability to write in an appropriate style.", cn: "考生撰写恰当文体的能力也会被评估。" }
      ]
    },
    { type: "heading", level: 2, text: "Speaking" },
    {
      type: "text",
      sentences: [
        { en: "This module consists of an oral interview between the candidate and an examiner. It takes between 11 and 14 minutes.", cn: "该模块包括考生与考官之间的口试。持续11至14分钟。" }
      ]
    },
    {
      type: "text",
      sentences: [
        { en: "There are three parts:", cn: "共分三部分：" }
      ]
    },
    // 使用卡片网格显示Speaking三部分
    {
      type: "grid",
      title: "Speaking Test Format",
      gridClass: "grid-3cols",
      items: [
        { title: "Part 1 (4-5 minutes) - Introduction and general questions about yourself, home, family, work/studies, and interests." },
        { title: "Part 2 (3-4 minutes) - Speak on a given topic for 1-2 minutes after 1 minute of preparation." },
        { title: "Part 3 (4-5 minutes) - Two-way discussion on abstract issues related to the Part 2 topic." }
      ]
    },
    {
      type: "text",
      sentences: [
        { en: "The Speaking module assesses whether candidates can communicate effectively in English. The assessment takes into account Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy, and Pronunciation.", cn: "口语模块评估考生是否能有效地用英语进行交流。评估考虑流利度与连贯性、词汇资源、语法范围与准确性以及发音。" }
      ]
    },
    { type: "heading", level: 2, text: "HOW IS IELTS SCORED?" },
    {
      type: "text",
      sentences: [
        { en: "IELTS results are reported on a nine-band scale. In addition to the score for overall language ability, IELTS provides a score in the form of a profile for each of the four skills (Listening, Reading, Writing and Speaking). These scores are also reported on a nine-band scale. All scores are recorded on the Test Report Form along with details of the candidate's nationality, first language and date of birth. Each Overall Band Score corresponds to a descriptive statement which gives a summary of the English language ability of a candidate classified at that level. The nine bands and their descriptive statements are as follows:", cn: "雅思考试成绩采用九分制报告。除了总体语言能力分数外，雅思还提供四项技能（听力、阅读、写作和口语）的分数。这些分数也采用九分制报告。所有分数都记录在考试成绩单上，同时附有考生的国籍、母语和出生日期。每个总分段对应一个描述性陈述，总结该级别考生的英语语言能力。九个分数段及其描述如下：" }
      ]
    },
    // 使用表格显示雅思分数段
    {
      type: "table",
      headers: ["Band", "Level", "Description"],
      rows: [
        ["9", "Expert User", "Has fully operational command of the language: appropriate, accurate and fluent with complete understanding."],
        ["8", "Very Good User", "Has fully operational command of the language with only occasional unsystematic inaccuracies and inappropriacies. Misunderstandings may occur in unfamiliar situations. Handles complex detailed argumentation well."],
        ["7", "Good User", "Has operational command of the language, though with occasional inaccuracies, inappropriacies and misunderstandings in some situations. Generally handles complex language well and understands detailed reasoning."],
        ["6", "Competent User", "Has generally effective command of the language despite some inaccuracies, inappropriacies and misunderstandings. Can use and understand fairly complex language, particularly in familiar situations."],
        ["5", "Modest User", "Has partial command of the language, coping with overall meaning in most situations, though is likely to make many mistakes. Should be able to handle basic communication in own field."],
        ["4", "Limited User", "Basic competence is limited to familiar situations. Has frequent problems in understanding and expression. Is not able to use complex language."],
        ["3", "Extremely Limited User", "Conveys and understands only general meaning in very familiar situations. Frequent breakdowns in communication occur."],
        ["2", "Intermittent User", "No real communication is possible except for the most basic information using isolated words or short formulae in familiar situations and to meet immediate needs. Has great difficulty understanding spoken and written English."],
        ["1", "Non User", "Essentially has no ability to use the language beyond possibly a few isolated words."],
        ["0", "Did not attempt the test", "No assessable information provided."]
      ]
    },
    {
      type: "text",
      sentences: [
        { en: "Most universities and colleges in the United Kingdom, Australia, New Zealand and Canada accept an IELTS Overall Band Score of 6.0 or 6.5 for entry to academic programmes. IELTS scores are recognised by over 500 universities and colleges in the USA.", cn: "英国、澳大利亚、新西兰和加拿大的大多数大学和学院接受雅思总分6.0或6.5作为学术课程的入学要求。雅思成绩被美国500多所大学和学院认可。" }
      ]
    },
    { type: "heading", level: 2, text: "MARKING THE PRACTICE TESTS" },
    { type: "heading", level: 3, text: "Listening and Reading" },
    {
      type: "text",
      sentences: [
        { en: "The Answer key is on pages 152–161.", cn: "答案在第152-161页。" },
        { en: "Each question in the Listening and Reading modules is worth one mark.", cn: "听力和阅读模块中的每个问题分值为1分。" }
      ]
    },
    {
      type: "text",
      sentences: [
        { en: "Questions which require letter/roman numeral answers - For questions where the answers are letters or Roman numerals, you should write only the number of answers required. If you have written more letters or numerals than are required, the answer must be marked wrong.", cn: "需要字母/罗马数字答案的问题 - 对于答案为字母或罗马数字的问题，只应写出所需答案的数量。如果写的字母或数字超过要求数量，则该答案必须判为错误。" }
      ]
    },
    {
      type: "text",
      sentences: [
        { en: "Questions which require answers in the form of words or numbers - Answers may be written in upper or lower case. Words in brackets are optional – they are correct, but not necessary. Alternative answers are separated by a single slash (/). If you are asked to write an answer using a certain number of words and/or (a) number(s), you will be penalised if you exceed this. For example, if a question specifies an answer using NO MORE THAN THREE WORDS and the correct answer is 'black leather coat', the answer 'coat of black leather' is incorrect. In questions where you are expected to complete a gap, you should only transfer the necessary missing word(s) onto the answer sheet. For example, to complete 'in the . . .', where the correct answer is 'morning', the answer 'in the morning' would be incorrect. All answers require correct spelling (including words in brackets). Both US and UK spelling are acceptable and are included in the Answer Key. All standard alternatives for numbers, dates and currencies are acceptable. All standard abbreviations are acceptable. You will find additional notes about individual questions in the Answer Key.", cn: "需要单词或数字形式答案的问题 - 答案可以用大写或小写字母书写。括号内的单词是可选的——它们是正确的，但不是必需的。备选答案用单斜杠（/）分隔。如果要求你用一定数量的单词和/或数字写答案，超出将会被扣分。例如，如果问题要求答案不超过三个单词，正确答案是'black leather coat'，那么答案'coat of black leather'就是错误的。在需要填空的问题中，只应将必要的缺失单词誊写到答题纸上。例如，要完成'in the . . .'，正确答案是'morning'，答案'in the morning'是错误的。所有答案都需要正确拼写（包括括号内的单词）。美式和英式拼写都可以接受，并包含在答案中。数字、日期和货币的所有标准形式都可以接受。所有标准缩写都可以接受。关于个别问题的额外说明，请参阅答案。" }
      ]
    },
    { type: "heading", level: 3, text: "Writing" },
    {
      type: "text",
      sentences: [
        { en: "It is not possible for you to give yourself a mark for the Writing tasks. For Task 1 in Tests 1 and 3, and Task 2 in Tests 2 and 4 and General Training Test B we have provided model answers (written by an examiner) at the back of the book. It is important to note that these show just one way of completing the task, out of many possible approaches. For Task 2 in Tests 1 and 3, and Task 1 in Tests 2 and 4 and General Training Test A, we have provided sample answers (written by candidates), showing their score and the examiner's comments. These model answers and sample answers will give you an insight into what is required for the Writing module.", cn: "你无法为自己的写作任务评分。对于测试1和3中的任务1，以及测试2和4中的任务2和培训类测试B，我们在书后提供了范文（由考官撰写）。需要注意的是，这些只是众多可能方法中的一种。对于测试1和3中的任务2，以及测试2和4中的任务1和培训类测试A，我们提供了考生写的答案样本，显示他们的分数和考官评语。这些范文和答案样本将让你深入了解写作模块的要求。" }
      ]
    },
    { type: "heading", level: 2, text: "HOW SHOULD YOU INTERPRET YOUR SCORES?" },
    {
      type: "text",
      sentences: [
        { en: "In the Answer Key at the end of each set of Listening and Reading answers you will find a chart which will help you assess whether, on the basis of your Practice Test results, you are ready to take the IELTS exam.", cn: "在每套听力和阅读答案末尾的答案中，你会找到一个图表，帮助你根据实践测试结果评估是否准备好参加雅思考试。" }
      ]
    },
    {
      type: "text",
      sentences: [
        { en: "In interpreting your score, there are a number of points you should bear in mind. Your performance in the real IELTS exam will be reported in two ways: there will be a Band Score from 1 to 9 for each of the modules and an Overall Band Score from 1 to 9, which is the average of your scores in the four modules. However, institutions considering your application are advised to look at both the Overall Band Score and the Band Scores for each module in order to determine whether you have the language skills needed for a particular course of study. For example, if your course has a lot of reading and writing, but no lectures, listening skills might be less important and a score of 5 in Listening might be acceptable if the Overall Band Score was 7. However, for a course which has lots of lectures and spoken instructions, a score of 5 in Listening might be unacceptable even though the Overall Band Score was 7.", cn: "在解释你的分数时，有几点需要牢记。你在真实雅思考试中的表现将以两种方式报告：每个模块有1到9的分数，以及四个模块分数的平均值——总分1到9。然而，建议考虑你申请的院校同时查看总分和每个模块的分数，以确定你是否具备特定学习课程所需的语言技能。例如，如果你的课程有大量阅读和写作，但没有讲座，听力技能可能不那么重要，如果总分是7分，听力5分可能是可以接受的。然而，对于一个有很多讲座和口头指导的课程，即使总分是7分，听力5分也可能是不可接受的。" }
      ]
    },
    {
      type: "text",
      sentences: [
        { en: "Once you have marked your tests you should have some idea of whether your listening and reading skills are good enough for you to try the IELTS exam. If you did well enough in one module but not in others, you will have to decide for yourself whether you are ready to take the exam.", cn: "一旦你完成了测试评分，你应该对自己的听力和阅读技能是否足够好以尝试雅思考试有所了解。如果你在一个模块中表现足够好，但在其他模块中不够好，你将需要自己决定是否准备好参加考试。" }
      ]
    },
    {
      type: "text",
      sentences: [
        { en: "The Practice Tests have been checked to ensure that they are of approximately the same level of difficulty as the real IELTS exam. However, we cannot guarantee that your score in the Practice Tests will be reflected in the real IELTS exam. The Practice Tests can only give you an idea of your possible future performance and it is ultimately up to you to make decisions based on your score.", cn: "实践测试已经过检查，以确保其难度水平与真实雅思考试大致相同。然而，我们不能保证你在实践测试中的分数会反映在真实雅思考试中。实践测试只能让你了解未来可能的表现，最终还是要由你自己根据分数做出决定。" }
      ]
    },
    {
      type: "text",
      sentences: [
        { en: "Different institutions accept different IELTS scores for different types of courses. We have based our recommendations on the average scores which the majority of institutions accept. The institution to which you are applying may, of course, require a higher or lower score than most other institutions.", cn: "不同的院校对不同类型的课程接受不同的雅思分数。我们的建议基于大多数院校接受的平均分数。当然，你申请的院校可能要求比大多数其他院校更高或更低的分数。" }
      ]
    },
    {
      type: "text",
      sentences: [
        { en: "Sample answers and model answers are provided for the Writing tasks. The sample answers were written by IELTS candidates; each answer has been given a band score and the candidate's performance is described. Please note that there are many different ways by which a candidate may achieve a particular band score. The model answers were written by an examiner as examples of very good answers, but it is important to understand that they are just one example out of many possible approaches.", cn: "写作任务提供了答案样本和范文。答案样本由雅思考生撰写；每个答案都有分数和考生的表现描述。请注意，考生可以通过许多不同的方式获得特定的分数。范文由考官撰写，作为优秀答案的示例，但重要的是要理解它们只是众多可能方法中的一个例子。" }
      ]
    },
    { type: "heading", level: 2, text: "Further information" },
    {
      type: "text",
      sentences: [
        { en: "For more information about IELTS or any other University of Cambridge ESOL examination write to:", cn: "如需了解更多关于雅思或任何其他剑桥大学ESOL考试的信息，请致函：" },
        { en: "University of Cambridge ESOL Examinations, 1 Hills Road, Cambridge, CB1 2EU, United Kingdom", cn: "剑桥大学ESOL考试委员会，英国剑桥郡希尔路1号，CB1 2EU" },
        { en: "Telephone: +44 1223 553311, Fax: +44 1223 460278, e-mail: ESOLhelpdesk@ucles.org.uk", cn: "电话：+44 1223 553311，传真：+44 1223 460278，电子邮件：ESOLhelpdesk@ucles.org.uk" },
        { en: "http://www.cambridgeesol.org, http://www.ielts.org", cn: "http://www.cambridgeesol.org，http://www.ielts.org" }
      ]
    }
  ],
  vocabulary: []
};
