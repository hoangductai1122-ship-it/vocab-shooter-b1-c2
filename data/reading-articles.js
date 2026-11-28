/* ==========================================================================
   IELTS Academic Reading Corpus — 20 A4-Length Articles (Science & Economics)
   Grounded in 2024–2026 Scientific Breakthroughs & Economic Research
   ========================================================================== */

window.READING_ARTICLES = [
  {
    id: "sci-01",
    num: 1,
    category: "science",
    tag: "Năng lượng & Khí hậu",
    sourceNote: "Science & Nature Breakthroughs · Global Electricity Transition",
    passage: 1,
    band: "Passage 1 · 5.5–6.5",
    metrics: { score: 23.8, avgSent: 17.8, c1c2Pct: 2.8, b2PlusPct: 11.7, fkGrade: 10.8 },
    topicId: 5,
    title: "The Tipping Point in Global Power: How Renewables Overtook Coal",
    titleVi: "Bước ngoặt điện năng toàn cầu: Năng lượng tái tạo chính thức vượt qua than đá",
    paragraphs: [
      {
        id: "A",
        text: "For more than one hundred years, burning coal was the main way the world produced electricity. It powered factories, railways, and growing cities from Britain to China. However, global energy data from 2025 and 2026 marked a historic turning point. For the first time, clean electricity from solar panels and wind turbines produced more power worldwide than coal stations. Energy experts say this was not a lucky accident caused by mild weather. Instead, it happened because clean technology has become much cheaper and faster to build.",
        gistVi: "Điện tái tạo từ mặt trời và gió lần đầu tiên trong lịch sử vượt qua nhiệt điện than nhờ chi phí giảm mạnh và tốc độ xây dựng nhanh."
      },
      {
        id: "B",
        text: "The biggest reason for this change is the falling price of solar panels and large batteries. Building a traditional coal or gas power plant often takes nearly ten years of planning and heavy construction. By contrast, solar panels are made in factories like everyday electronics. Each time global production doubles, the cost of making each panel drops further. China installed record numbers of solar farms in a single year, while countries in South Asia, Europe, and Latin America bought affordable panels to bring electricity to millions of homes.",
        gistVi: "Động lực chính là giá tấm pin mặt trời và pin tích trữ ngày càng rẻ nhờ sản xuất hàng loạt trong nhà máy thay vì mất gần 10 năm xây nhà máy than."
      },
      {
        id: "C",
        text: "Even so, producing more clean electricity has created a new technical problem for national power grids. Solar farms generate huge amounts of power around noon, when the sun is brightest, but output falls to zero after sunset. Older power lines were built to carry steady electricity from a few large coal plants, not sudden waves of solar energy. On very sunny or windy afternoons, grid managers sometimes have to practice 'curtailment'—switching off working wind and solar farms so power lines do not overload, then turning gas or coal plants back on in the evening.",
        gistVi: "Tuy nhiên, điện mặt trời chỉ mạnh vào buổi trưa rồi tắt lúc tối khiến lưới điện cũ bị quá tải cục bộ, buộc nhà quản lý đôi khi phải ngắt bớt trạm điện sạch."
      },
      {
        id: "D",
        text: "Engineers are now testing practical solutions to fix this timing gap. Many power companies attach giant battery parks next to solar farms. These batteries store extra electricity at midday and release it when families return home and cook dinner at night. Governments are also building long, high-voltage cables to connect sunny desert regions with windy coastal areas. At the same time, smart computer programs study satellite cloud images to predict weather changes hours ahead, helping power grids stay balanced every second.",
        gistVi: "Để khắc phục lệch giờ, ngành điện đang lắp các trạm pin khổng lồ tích điện buổi trưa xả buổi tối, kéo cáp cao thế liên vùng và dùng phần mềm dự báo mây."
      },
      {
        id: "E",
        text: "Despite this encouraging progress, climate scientists warn that the job is far from finished. Passing coal in percentage share does not mean total carbon pollution is falling fast enough. Global demand for electricity is rising quickly because more people are using electric cars, factory heat pumps, air conditioners, and large artificial intelligence data centers. Therefore, to reduce global warming, countries must not only build new wind and solar farms, but also close older coal plants earlier than planned.",
        gistVi: "Các nhà khoa học cảnh báo tổng nhu cầu điện toàn cầu vẫn tăng nhanh do xe điện, điều hòa và trung tâm dữ liệu AI, nên cần đóng cửa sớm các nhà máy than cũ."
      }
    ],
    questions: [
      {
        id: "q1",
        type: "tfng",
        prompt: "Analysts believe that renewable electricity surpassing coal was mainly a brief statistical fluke caused by unusually mild winters.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 1,
        para: "A",
        explainVi: "Đoạn A khẳng định rõ đây KHÔNG phải là sự trùng hợp may mắn do thời tiết ôn hòa ('not a lucky accident caused by mild weather'), mà nhờ chi phí giảm mạnh và lắp đặt nhanh → FALSE."
      },
      {
        id: "q2",
        type: "tfng",
        prompt: "High-voltage direct current cables completely eliminate all energy loss during intercontinental transmission.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 2,
        para: "D",
        explainVi: "Đoạn D có nhắc đường dây một chiều cao áp (HVDC) nối các vùng nắng và gió để cân bằng biến động thời tiết, nhưng hoàn toàn không đề cập việc loại bỏ 100% hao hụt điện năng → NOT GIVEN."
      },
      {
        id: "q3",
        type: "mcq",
        prompt: "What does the term 'curtailment' in Paragraph C refer to?",
        options: [
          "A. Fining households that consume excessive electricity in the evening",
          "B. Intentionally shutting off active renewable generators when the grid is overloaded",
          "C. Converting old coal power stations into battery storage facilities",
          "D. Reducing government subsidies for imported solar panels"
        ],
        answer: 1,
        para: "C",
        explainVi: "Đoạn C giải thích trực tiếp sau dấu gạch ngang: 'deliberately disconnecting functioning wind and solar farms during sunny or windy afternoons' → Đáp án B."
      },
      {
        id: "q4",
        type: "mcq",
        prompt: "Why do climate researchers warn against complacency in Paragraph E?",
        options: [
          "A. Solar silicon reserves are expected to run out within twenty years",
          "B. Developing countries have stopped importing clean energy modules",
          "C. Soaring overall electricity demand means fossil plants must still be retired faster to cut total emissions",
          "D. Machine-learning grid software consumes more electricity than it saves"
        ],
        answer: 2,
        para: "E",
        explainVi: "Đoạn E nêu rõ tổng nhu cầu điện tăng mạnh (do xe điện, điều hòa, trung tâm dữ liệu AI), nên năng lượng sạch phải vừa đáp ứng phần tăng thêm vừa thay thế sớm các nhà máy nhiên liệu hóa thạch hiện hữu → Đáp án C."
      }
    ]
  },
  {
    id: "eco-20",
    num: 2,
    category: "economics",
    tag: "Kinh tế Đô thị & Tài khóa Công",
    sourceNote: "Brookings, NBER Urban Economics & UNCTAD/OECD Sovereign Fiscal Outlook",
    passage: 1,
    band: "Passage 1 · 5.5–6.5",
    metrics: { score: 28.0, avgSent: 19.7, c1c2Pct: 2.8, b2PlusPct: 12.2, fkGrade: 11.4 },
    topicId: 14,
    title: "Hybrid Cities and Constrained States: Urban Reallocation Meets Sovereign Debt",
    titleVi: "Đô thị làm việc kết hợp và không gian tài khóa hẹp: Tái phân bổ thành phố trước áp lực nợ công",
    paragraphs: [
      {
        id: "A",
        text: "Five years after online video meetings emptied city centers around the world, urban economists have reached a clear conclusion. Hybrid work—splitting the week between home and the office—is here to stay, but it has not killed big cities. In major cities across North America, Britain, Europe, and Australia, daily office attendance has settled about twenty-five to thirty percent below pre-2020 levels, busiest from Tuesday to Thursday. Instead of disappearing, city centers are changing from pure office zones into lively mixed neighborhoods with cafes, parks, and cultural events.",
        gistVi: "Sau 5 năm, làm việc kết hợp (hybrid work) đã ổn định ở mức đến văn phòng thấp hơn 25–30% trước năm 2020, biến trung tâm thành phố thành khu phố đa năng sống động."
      },
      {
        id: "B",
        text: "Inside the office property market, however, a sharp gap has opened between new and old buildings. Modern, sunlit 'Class A' towers with good energy ratings near train stations still attract companies willing to pay high rents. By contrast, older 'Class B and C' glass office blocks from the 1970s and 1980s have lost twenty to forty percent of their market value. Lower office values mean cities collect less property tax, forcing local leaders to adjust budgets and update building rules.",
        gistVi: "Thị trường cao ốc chia làm hai nửa: tòa nhà hạng A hiện đại gần ga tàu vẫn giữ giá cao, còn tòa hạng B và C xây thập niên 1970–1980 giảm giá trị tới 20–40%."
      },
      {
        id: "C",
        text: "Turning empty 1980s office towers into apartments sounds easy, but building design makes it surprisingly tricky. Apartment bedrooms need windows that open for fresh air and daylight, plus many vertical water pipes for dozens of kitchens and bathrooms on every floor. Many older offices were built as wide, deep rectangles with windowless middle spaces around central lifts. Studies show that only ten to fifteen percent of older downtown offices can be converted into homes affordably without special city tax help, so building new apartments on empty urban land is just as important.",
        gistVi: "Cải tạo văn phòng cũ thành căn hộ rất khó về kỹ thuật vì sàn quá sâu thiếu cửa sổ và ống dẫn nước, nên chỉ khoảng 10–15% tòa nhà cũ chuyển đổi hiệu quả."
      },
      {
        id: "D",
        text: "While city mayors adapt to hybrid work, national governments face tighter public budgets of their own. During the 2010s, central bank interest rates were close to zero, so governments could borrow money very cheaply. After inflation rose in the early 2020s, central banks raised interest rates sharply. As old, low-rate government bonds reached their end date, countries had to refinance that sovereign debt at much higher interest yields. In many developing nations, yearly interest payments now take up as much public money as schools, roads, or flood defenses.",
        gistVi: "Ở cấp quốc gia, các khoản nợ trái phiếu lãi suất thấp thập niên 2010 đến hạn phải vay đảo nợ ở lãi suất cao hơn nhiều, khiến tiền trả lãi nợ công ngốn ngân sách ngang giáo dục và giao thông."
      },
      {
        id: "E",
        text: "Rather than making harsh spending cuts across every public service, economists recommend practical reforms that help cities and economies grow. Faster building permits make it easier for private builders to add housing near public transport. Flexible mixed-use zoning lets shops, offices, and homes share the same street instead of keeping districts strictly separate. Finally, modern digital tax systems help developing nations collect revenue fairly and borrow at lower rates. Cities and countries succeed best when they adapt quickly to new habits.",
        gistVi: "Thay vì cắt giảm chi tiêu cực đoan, giới kinh tế khuyên nên rút gọn thủ tục cấp phép xây nhà gần tàu điện, quy hoạch khu phố hỗn hợp và hiện đại hóa quản lý thuế số."
      }
    ],
    questions: [
      {
        id: "q1",
        type: "tfng",
        prompt: "Older 'Class B and C' office buildings from the 1970s and 1980s maintained higher market valuations than modern energy-efficient 'Class A' towers.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 1,
        para: "B",
        explainVi: "Đoạn B chỉ ra điều ngược lại: tòa nhà hạng A hiện đại giữ giá tốt, còn các tòa hạng B và C xây thập niên 1970–1980 bị sụt giảm định giá từ 20% đến 40% → FALSE."
      },
      {
        id: "q2",
        type: "tfng",
        prompt: "Architectural layouts—such as deep windowless interiors and limited plumbing stacks—make converting most 1980s office towers into apartments technically challenging.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 0,
        para: "C",
        explainVi: "Đoạn C giải thích chi tiết rào cản kiến trúc (lõi sàn rộng không có cửa sổ cho phòng ngủ và thiếu đường ống nước dày đặc), khiến chỉ khoảng 10–15% tòa nhà văn phòng cũ dễ chuyển đổi → TRUE."
      },
      {
        id: "q3",
        type: "mcq",
        prompt: "What caused sovereign debt interest payments to consume a larger share of government budgets in the mid-2020s?",
        options: [
          "A. Central banks permanently lowered interest rates below negative two percent",
          "B. Maturing low-rate government debt from the 2010s had to be refinanced at much higher post-inflation interest yields",
          "C. Developing countries abolished all domestic income taxes",
          "D. Municipal transit agencies took over national central banks"
        ],
        answer: 1,
        para: "D",
        explainVi: "Đoạn D giải thích các khoản trái phiếu lãi suất siêu thấp thập niên 2010 khi đáo hạn vào giữa thập niên 2020 đã phải tái cấp vốn ở mức lợi suất cao hơn nhiều sau đợt thắt chặt tiền tệ chống lạm phát → Đáp án B."
      },
      {
        id: "q4",
        type: "mcq",
        prompt: "Instead of harsh across-the-board spending cuts, what do economists recommend in Paragraph E?",
        options: [
          "A. Forcing employees by law to commute to downtown offices seven days a week",
          "B. Streamlining housing permits, adopting flexible mixed-use zoning, and modernizing tax administration",
          "C. Demolishing all public transit stations built before the year 2000",
          "D. Freezing every urban neighborhood exclusively for single-purpose office use"
        ],
        answer: 1,
        para: "E",
        explainVi: "Đoạn E khuyến nghị các cải cách chi phí thấp nhưng hiệu suất xã hội cao: tinh gọn thủ tục cấp phép xây nhà gần giao thông công cộng, quy hoạch khu hỗn hợp linh hoạt và hiện đại hóa quản lý thuế số → Đáp án B."
      }
    ]
  },
  {
    id: "eco-17",
    num: 3,
    category: "economics",
    tag: "Nhân khẩu học & Kinh tế Vĩ mô",
    sourceNote: "ECB, IMF & Demographic Macroeconomics · Global Aging & Automation",
    passage: 1,
    band: "Passage 1 · 5.5–6.5",
    metrics: { score: 31.5, avgSent: 18.2, c1c2Pct: 3.8, b2PlusPct: 16.2, fkGrade: 11.5 },
    topicId: 7,
    title: "The Great Demographic Inversion: Aging Societies, Inflation, and the Silver Economy",
    titleVi: "Cuộc đảo chiều nhân khẩu học vĩ đại: Già hóa dân số, lạm phát và nền kinh tế tóc bạc",
    paragraphs: [
      {
        id: "A",
        text: "During the late twentieth century, the world economy enjoyed a huge population boost. Hundreds of millions of young adults entered factories and offices across East Asia, Europe, and Latin America. This large workforce kept wages steady, produced cheap goods, and built up massive retirement savings. By the mid-2020s, however, population experts confirmed that this trend is turning around. Birth rates have dropped well below the replacement level of 2.1 children per woman not only in Japan, South Korea, and Italy, but also in middle-income nations like China, Thailand, and Brazil.",
        gistVi: "Lợi thế dân số trẻ cuối thế kỷ 20 đang đảo chiều khi tỷ lệ sinh giảm sâu dưới 2,1 con/phụ nữ không chỉ ở Nhật, Hàn, Ý mà cả Trung Quốc, Thái Lan, Brazil."
      },
      {
        id: "B",
        text: "When the number of retirees grows faster than the number of active workers, government budgets feel immediate pressure. Public pension funds and national hospitals must spend much more money just as fewer young people are paying income taxes. For many years, economists such as Alvin Hansen and Larry Summers thought an aging society would mainly cause slow growth and very low prices. They argued that middle-aged workers save heavily for old age instead of spending, while companies build fewer new factories when populations stop growing.",
        gistVi: "Khi người nghỉ hưu tăng nhanh hơn người đi làm, ngân sách lương hưu và y tế chịu áp lực lớn; trước đây giới kinh tế cho rằng già hóa chủ yếu làm kinh tế chậm lại."
      },
      {
        id: "C",
        text: "More recent research by economists Charles Goodhart and Manoj Pradhan offers a surprising new view: advanced aging can actually push inflation up. Retired people stop producing goods and services, yet they still need housing, food, and especially daily medical and nursing care. Because fewer young workers are entering the job market, hospitals, transport firms, and service businesses compete harder to hire staff. This worker shortage pushes wages and service prices upward unless technology helps each worker produce more.",
        gistVi: "Nghiên cứu mới của Goodhart và Pradhan lại chỉ ra già hóa sâu dễ đẩy giá tăng: người già ngừng sản xuất nhưng vẫn cần chăm sóc y tế, gây thiếu lao động và tăng lương dịch vụ."
      },
      {
        id: "D",
        text: "Real-world evidence from the oldest industrial countries shows that worker shortages strongly speed up technology use. Studies by Daron Acemoglu and Pascual Restrepo found that rapidly aging countries—such as South Korea, Japan, and Germany—install factory robots and automated warehouse tools much faster than younger countries. At the same time, a lively 'silver economy' is creating new business opportunities. Companies are shifting research from youth fashion toward healthy-aging medicine, helpful home robots, and flexible part-time jobs for active seniors.",
        gistVi: "Thực tế tại Hàn Quốc, Nhật và Đức cho thấy thiếu hụt lao động thúc đẩy lắp đặt robot nhanh hơn hẳn các nước trẻ, đồng thời mở ra 'nền kinh tế tóc bạc'."
      },
      {
        id: "E",
        text: "Machines alone, however, cannot replace warm human care in nursing homes or fix pension budgets overnight. Economists say countries need sensible workplace and family reforms as well. One key step is changing strict seniority-based pay rules that force healthy, capable sixty-year-olds out of their jobs too early. Governments can also lower the cost of childcare and offer fair parental leave so young couples feel supported when raising children. Aging is certain, but smart policies can keep societies prosperous.",
        gistVi: "Máy móc không thể thay hoàn toàn bàn tay chăm sóc con người, nên các nước cần bỏ quy định ép nghỉ hưu sớm theo lương thâm niên và hỗ trợ chi phí nuôi con cho người trẻ."
      }
    ],
    questions: [
      {
        id: "q1",
        type: "tfng",
        prompt: "Fertility rates have remained well above 2.1 children per woman across all middle-income nations such as Thailand and Brazil.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 1,
        para: "A",
        explainVi: "Đoạn A khẳng định tỷ suất sinh đã giảm xuống dưới ngưỡng thay thế 2,1 không chỉ ở Nhật, Hàn, châu Âu mà ngày càng rõ ở cả Trung Quốc, Thái Lan, Brazil → FALSE."
      },
      {
        id: "q2",
        type: "tfng",
        prompt: "Studies show that rapidly aging industrial countries tend to adopt robotics and automation faster than demographically younger countries.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 0,
        para: "D",
        explainVi: "Đoạn D dẫn nghiên cứu của Acemoglu & Restrepo cho thấy các quốc gia già hóa nhanh (Hàn Quốc, Nhật, Đức) ứng dụng robot công nghiệp và tự động hóa ở tốc độ cao hơn hẳn các nền kinh tế trẻ → TRUE."
      },
      {
        id: "q3",
        type: "mcq",
        prompt: "Why do economists Goodhart and Pradhan argue that advanced population aging can generate inflationary pressures?",
        options: [
          "A. Retirees print their own currency to pay for international vacations",
          "B. Retirees keep consuming goods and care services while no longer producing output, tightening labor supply and wages",
          "C. Young workers refuse to use automated warehouse equipment",
          "D. Elderly populations consume zero healthcare services after age sixty-five"
        ],
        answer: 1,
        para: "C",
        explainVi: "Đoạn C giải thích người nghỉ hưu ngừng sản xuất nhưng vẫn tiếp tục tiêu dùng (đặc biệt dịch vụ chăm sóc sức khỏe thâm dụng lao động), kết hợp lực lượng lao động trẻ thu hẹp làm tăng tiền lương và áp lực giá cả → Đáp án B."
      },
      {
        id: "q4",
        type: "mcq",
        prompt: "Which workplace reform does Paragraph E highlight to help older adults stay productively engaged?",
        options: [
          "A. Eliminating all public healthcare coverage after age sixty",
          "B. Reforming rigid seniority-based pay structures that force capable older workers out of jobs early",
          "C. Replacing all hospital nurses with industrial welding robots",
          "D. Taxing phased-retirement part-time income at ninety percent"
        ],
        answer: 1,
        para: "E",
        explainVi: "Đoạn E nêu giải pháp thiết kế lại quy tắc lương thâm niên cứng nhắc vốn đẩy những người 60 tuổi còn khỏe mạnh rời bỏ công việc quá sớm → Đáp án B."
      }
    ]
  },
  {
    id: "sci-06",
    num: 4,
    category: "science",
    tag: "Hóa học vật liệu · Giải Nobel 2025",
    sourceNote: "2025 Nobel Prize in Chemistry · Metal–Organic Frameworks (MOFs)",
    passage: 1,
    band: "Passage 1 · 5.5–6.5",
    metrics: { score: 39.0, avgSent: 18.1, c1c2Pct: 6.9, b2PlusPct: 19.3, fkGrade: 10.8 },
    topicId: 2,
    title: "Molecular Sponges: Metal–Organic Frameworks Harvesting Water from Desert Air",
    titleVi: "Bọt biển phân tử: Khung cơ kim (MOFs) thu hoạch nước sạch từ không khí sa mạc",
    paragraphs: [
      {
        id: "A",
        text: "Imagine holding a single gram of white powder, about the size of a sugar cube. Inside that tiny pinch of crystal lies enough inner surface area to cover an entire football field. These remarkable materials are called metal–organic frameworks, or MOFs, and their invention won Richard Robson, Susumu Kitagawa, and Omar Yaghi the 2025 Nobel Prize in Chemistry. Chemists build MOFs by joining metal atoms with carbon-based linker molecules. Together, they form a strong three-dimensional frame filled with millions of tiny, even-sized holes.",
        gistVi: "Khung cơ kim (MOFs) đạt giải Nobel Hóa học 2025 là vật liệu tinh thể rỗng siêu vi, chỉ 1 gam bột có diện tích bề mặt bên trong rộng ngang cả sân bóng đá."
      },
      {
        id: "B",
        text: "When scientists first tried to make porous crystals in the late twentieth century, they faced a frustrating problem. As soon as liquid solvents dried out of the tiny holes, the weak atomic frame collapsed like a flat tent. Kitagawa and Yaghi solved this issue by using stronger chemical bonds so the open holes stayed firm permanently. Even better, chemists found they could change the metal parts or lengthen the connecting rods to adjust the hole size. This allows a crystal to trap one chosen gas while letting other gases pass right through.",
        gistVi: "Những tinh thể xốp đời đầu thường bị sập khi bay hơi dung môi, nhưng Kitagawa và Yaghi đã tạo được bộ khung bền vững và tùy chỉnh được kích thước lỗ lọc khí."
      },
      {
        id: "C",
        text: "One exciting everyday use for MOFs is collecting clean drinking water from dry desert air. Even in hot deserts where humidity falls below twenty percent and ordinary fog nets or electric machines fail, the air still holds invisible water vapor. Special MOF crystals made from aluminum or zirconium love water molecules. When trays of this powder sit outside in the cool desert night, they soak up moisture from the air without using any electricity. In the morning, gentle heat from sunlight releases the trapped vapor as fresh liquid water.",
        gistVi: "Ứng dụng nổi bật nhất là thu nước uống từ không khí sa mạc khô hạn: bột MOF tự hút ẩm ban đêm không tốn điện và nhả ra nước sạch dưới nắng sáng."
      },
      {
        id: "D",
        text: "Engineers are also testing MOFs to cut pollution at cement and steel factories. Today, many factories wash exhaust smoke using liquid amine chemicals to catch carbon dioxide. However, those liquids can damage metal pipes and need high heat to boil out the captured carbon for underground storage. Solid MOF filters catch carbon dioxide effectively even in damp factory smoke, and they release the gas at much lower temperatures. As a result, factories can save nearly one third of the energy normally wasted during carbon capture.",
        gistVi: "Tại nhà máy thép và xi măng, bộ lọc rắn MOFs bắt giữ khí CO₂ và nhả khí ở nhiệt độ thấp hơn dung dịch amine lỏng, giúp tiết kiệm gần 1/3 năng lượng."
      },
      {
        id: "E",
        text: "For a long time, MOFs stayed inside university labs because making them required costly chemical solvents and produced only a few grams per day. Recently, greener factory methods have changed the picture. Manufacturers can now mix common metal salts in water or continuous machines to produce tons of powder at much lower prices. Aided by computer programs that test thousands of crystal shapes for heat strength, these 'molecular sponges' are moving rapidly from laboratory curiosities into practical tools for clean water and air.",
        gistVi: "Trước đây MOFs khó phổ biến vì dung môi đắt và làm từng mẻ nhỏ, nay công nghệ sản xuất bằng nước quy mô lớn đã kéo giá thành xuống mức thương mại."
      }
    ],
    questions: [
      {
        id: "q1",
        type: "tfng",
        prompt: "Early porous coordination structures often collapsed once liquid solvents left their internal cavities.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 0,
        para: "B",
        explainVi: "Đoạn B mô tả các cấu trúc thời kỳ đầu thường sụp đổ ngay khi dung môi bay hơi khỏi lỗ xốp ('collapsed like a deflated tent') → TRUE."
      },
      {
        id: "q2",
        type: "tfng",
        prompt: "Desert MOF water harvesters require high-voltage electrical pumps to absorb moisture during the night.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 1,
        para: "C",
        explainVi: "Đoạn C khẳng định ngược lại: vào ban đêm tinh thể tự động hút hơi nước mà KHÔNG tiêu thụ điện năng ('spontaneously drink in water vapor without consuming any electricity') → FALSE."
      },
      {
        id: "q3",
        type: "mcq",
        prompt: "What advantage do solid MOF sorbents hold over traditional liquid amine scrubbers in cement and steel factories?",
        options: [
          "A. They convert carbon dioxide directly into structural steel",
          "B. They release captured carbon at lower temperatures, reducing energy costs",
          "C. They eliminate the need to store captured carbon underground",
          "D. They operate only when exhaust gas contains zero moisture"
        ],
        answer: 1,
        para: "D",
        explainVi: "Đoạn D chỉ rõ chất hấp phụ rắn MOFs tái sinh ở nhiệt độ thấp hơn đáng kể so với dung dịch amine lỏng, giúp giảm gần 1/3 mức tiêu hao năng lượng thu giữ carbon → Đáp án B."
      },
      {
        id: "q4",
        type: "mcq",
        prompt: "What previously slowed the widespread industrial adoption of MOFs according to Paragraph E?",
        options: [
          "A. A global shortage of aluminum and zirconium ores",
          "B. Strict international patents prohibiting cement factories from testing crystals",
          "C. Costly chemical solvents and tiny-batch laboratory synthesis methods",
          "D. Public opposition to harvesting moisture from desert ecosystems"
        ],
        answer: 2,
        para: "E",
        explainVi: "Đoạn E nêu rào cản trước đây là dung môi hữu cơ đắt đỏ và phương pháp tổng hợp từng mẻ nhỏ chỉ thu được vài gam mỗi ngày → Đáp án C."
      }
    ]
  },
  {
    id: "sci-10",
    num: 5,
    category: "science",
    tag: "Nhiệt hạch & Hệ thống Trái Đất",
    sourceNote: "Tokamak High-Density Plasma Regimes & WMO/Nature Antarctic Ozone Recovery",
    passage: 1,
    band: "Passage 1 · 5.5–6.5",
    metrics: { score: 47.3, avgSent: 18.3, c1c2Pct: 10.0, b2PlusPct: 21.0, fkGrade: 10.8 },
    topicId: 5,
    title: "Taming Starfire and Healing the Sky: Fusion Milestones and the Ozone Lesson",
    titleVi: "Thuần hóa lửa sao và chữa lành bầu trời: Cột mốc nhiệt hạch và bài học tầng Ozone",
    paragraphs: [
      {
        id: "A",
        text: "Two major science stories—one inside super-hot laboratory machines and the other high in the sky above Antarctica—show how human effort can solve huge energy and environmental problems. In fusion energy research, scientists working at ring-shaped magnetic machines called tokamaks set impressive new records. Facilities such as China's EAST reactor kept glowing hydrogen gas stable for more than one thousand seconds. Researchers also pushed the fuel past an old safety ceiling known as the Greenwald density limit without losing control.",
        gistVi: "Hai tin vui khoa học — lò nhiệt hạch duy trì khí plasma ổn định hơn 1.000 giây và tầng ozone Nam Cực phục hồi — cho thấy khả năng giải quyết bài toán lớn của nhân loại."
      },
      {
        id: "B",
        text: "Why is fuel density so important for future fusion power? Today's nuclear power stations split heavy uranium atoms, which leaves behind long-lasting radioactive waste. Fusion works the opposite way: it joins light hydrogen forms, deuterium and tritium, to make harmless helium and release vast clean heat. Crucially, doubling the density of fuel ions inside a magnetic chamber roughly quadruples the power produced. In the past, packing fuel too tightly caused sudden bursts at the chamber wall that stopped the reaction. Better magnetic control and tough tungsten walls have now solved much of that problem.",
        gistVi: "Nhiệt hạch ghép hạt nhân nhẹ tạo khí heli sạch; nhân đôi mật độ nhiên liệu giúp tăng gấp bốn sản lượng điện, và nay từ trường mới đã giữ phản ứng ổn định."
      },
      {
        id: "C",
        text: "Even with these records, serious engineering challenges still stand between experimental fusion machines and home electricity sockets. Fast neutrons flying out of the fusion core hit the surrounding steel walls hard, so scientists must invent stronger metal alloys. In addition, tritium fuel is very rare in nature. Future reactors will need to wrap lithium blankets around the chamber so escaping neutrons can breed fresh tritium fuel inside the plant. Meanwhile, compact high-temperature superconducting magnets are helping startups build smaller, cheaper test reactors.",
        gistVi: "Dù vậy, điện nhiệt hạch chưa thể nối vào ổ cắm gia đình ngay vì còn cần vật liệu chịu hạt neutron và lớp chăn lithium để tự tạo nhiên liệu tritium hiếm."
      },
      {
        id: "D",
        text: "While engineers work on tomorrow's clean power, weather satellites brought good news from twenty kilometers above Antarctica. Data from 2025 and 2026 showed that the yearly ozone hole shrank to one of its smallest sizes in years, staying on course to heal fully by the middle of this century. Back in 1987, countries signed the Montreal Protocol to ban chlorofluorocarbons, or CFCs, once used in old fridges and spray cans. Since then, harmful chlorine in the upper air has slowly dropped, preventing millions of skin cancer cases.",
        gistVi: "Trên bầu trời Nam Cực, vệ tinh xác nhận lỗ thủng tầng ozone tiếp tục thu hẹp nhờ Nghị định thư Montreal 1987 cấm khí CFC trong tủ lạnh và bình xịt cũ."
      },
      {
        id: "E",
        text: "Scientists point out that stopping fossil fuels is much harder than banning CFCs was. Only a small number of chemical companies manufactured CFCs, and those firms quickly earned profits by selling patented, safer cooling gases instead. By contrast, coal, oil, and gas are deeply connected to transport, farming, cement, and home heating in every country. Still, the healing ozone layer proves that global agreements can work when clear rules and better technologies move forward together.",
        gistVi: "Loại bỏ nhiên liệu hóa thạch khó hơn cấm CFC vì chỉ ít công ty sản xuất CFC, trong khi than dầu gắn với mọi ngành nghề; tuy nhiên bài học hợp tác quốc tế vẫn rất giá trị."
      }
    ],
    questions: [
      {
        id: "q1",
        type: "tfng",
        prompt: "Doubling the density of fuel ions inside a magnetic fusion chamber roughly quadruples the resulting fusion power output.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 0,
        para: "B",
        explainVi: "Đoạn B giải thích công suất nhiệt hạch tỷ lệ với bình phương mật độ plasma: nhân đôi mật độ hạt nhân nhiên liệu sẽ làm tăng gấp bốn lần sản lượng năng lượng ('doubling the concentration... quadruples energy yield') → TRUE."
      },
      {
        id: "q2",
        type: "tfng",
        prompt: "Commercial fusion power plants already supply over ten percent of residential electricity in East Asia.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 1,
        para: "C",
        explainVi: "Đoạn C nêu rõ vẫn còn nhiều rào cản kỹ thuật ngăn cách các kỷ lục plasma thử nghiệm với điện năng thương mại ('still separate experimental plasma records from wall-socket electricity') → FALSE."
      },
      {
        id: "q3",
        type: "mcq",
        prompt: "What role do lithium blankets play in proposed commercial fusion reactors?",
        options: [
          "A. Cooling stratospheric ozone sensors aboard satellites",
          "B. Breeding scarce tritium fuel when struck by neutrons inside the reactor",
          "C. Absorbing chlorofluorocarbons from old refrigeration units",
          "D. Replacing superconducting magnets with permanent iron cores"
        ],
        answer: 1,
        para: "C",
        explainVi: "Đoạn C viết lò phản ứng phải tự nhân giống nguồn nhiên liệu tritium khan hiếm bên trong lớp vỏ chăn lithium bao quanh buồng phản ứng → Đáp án B."
      },
      {
        id: "q4",
        type: "mcq",
        prompt: "Why was phasing out chlorofluorocarbons easier than phasing out fossil fuels according to Paragraph E?",
        options: [
          "A. Chlorofluorocarbons broke down naturally within forty-eight hours",
          "B. Only a small number of chemical firms made CFCs and could profitably switch to patented alternatives",
          "C. Developing nations never used refrigerators prior to the year 2000",
          "D. Ultraviolet radiation did not affect human health"
        ],
        answer: 1,
        para: "E",
        explainVi: "Đoạn E chỉ rõ CFC chỉ do một số ít tập đoàn hóa chất sản xuất và họ nhanh chóng hưởng lợi khi đăng ký sáng chế chất làm lạnh thay thế an toàn hơn, trái với carbon gắn chặt vào mọi ngành kinh tế → Đáp án B."
      }
    ]
  },
  {
    id: "eco-15",
    num: 6,
    category: "economics",
    tag: "Địa kinh tế & Chuỗi cung ứng Bán dẫn",
    sourceNote: "OECD, IMF & IEA Global Critical Minerals and Supply-Chain Resilience Reports",
    passage: 1,
    band: "Passage 1 · 5.5–6.5",
    metrics: { score: 48.7, avgSent: 20.2, c1c2Pct: 7.1, b2PlusPct: 20.3, fkGrade: 13.5 },
    topicId: 3,
    title: "From Just-in-Time to Just-in-Case: Semiconductors and Critical Mineral Geoeconomics",
    titleVi: "Từ 'Đúng lúc' sang 'Phòng hờ': Địa kinh tế học bán dẫn và khoáng sản thiết yếu",
    paragraphs: [
      {
        id: "A",
        text: "For thirty years, business schools taught companies one golden rule for supply chains: 'just-in-time' efficiency. Global firms spread production across many countries to save a few cents on every part, kept warehouses nearly empty, and trusted cargo ships to arrive right on schedule. Between 2020 and 2026, however, pandemic port delays, severe storms, and political tensions changed that mindset. Today, companies and governments are shifting toward 'just-in-case' planning, especially for computer microchips and clean-energy minerals.",
        gistVi: "Sau 30 năm theo đuổi mô hình 'đúng lúc' không giữ hàng tồn kho, dịch bệnh, bão lũ và căng thẳng chính trị đã buộc thế giới chuyển sang tư duy 'phòng hờ' cho chip và khoáng sản."
      },
      {
        id: "B",
        text: "This reliance on a few places is clearest in advanced microchips, which run smartphones, hospitals, cars, and artificial intelligence. Making a single top-tier chip requires design software from California, pure chemicals from Japan, and extreme-ultraviolet lithography machines assembled exclusively in the Netherlands using German lenses. Most of the actual chip printing then happens in Taiwan and South Korea. Worried that a single earthquake or trade dispute could stop factories worldwide, the United States, Europe, and Japan offered billions of dollars in subsidies to build local chip plants.",
        gistVi: "Sản xuất một con chip hiện đại phụ thuộc vào mắt xích độc quyền tại Mỹ, Nhật, Hà Lan, Đài Loan và Hàn Quốc, khiến nhiều nước chi hàng tỷ đô kéo nhà máy về nước."
      },
      {
        id: "C",
        text: "Yet bringing chip manufacturing home has proved harder and costlier than politicians expected. Building an advanced semiconductor factory in the United States or Germany costs roughly thirty to fifty percent more than in East Asia, and construction takes longer too. Local regions often lack enough trained cleanroom technicians and nearby parts suppliers. Economists at the International Monetary Fund also warn that if every country copies the same subsidies and trade barriers, research sharing slows down and everyday electronics become more expensive for buyers.",
        gistVi: "Xây nhà máy chip tại Mỹ hay Đức đắt hơn 30–50% so với Đông Á do thiếu kỹ thuật viên và nhà cung ứng phụ trợ, dễ làm tăng giá hàng điện tử tiêu dùng."
      },
      {
        id: "D",
        text: "A similar bottleneck exists earlier in the supply chain for critical minerals like lithium, cobalt, nickel, gallium, and rare earth metals. These materials are essential for electric-car batteries and wind turbines. Although raw mineral ores are dug from mines across South America, Africa, Australia, and Southeast Asia, the midstream chemical refining and processing stage is heavily concentrated: one country, China, refines between sixty and ninety percent of global supply. Even when heavy rain flooded a single pure quartz mine in North Carolina, tech firms realized how one small material shortage can threaten huge industries.",
        gistVi: "Với khoáng sản thiết yếu (lithium, đất hiếm...), dù mỏ quặng nằm ở nhiều châu lục nhưng khâu tinh luyện hóa chất trung nguồn lại tập trung tới 60–90% ở một quốc gia."
      },
      {
        id: "E",
        text: "No country can realistically mine every mineral and build every microchip inside its own borders. Instead, economists recommend two practical steps. First, trade partnerships can spread mineral refining across more nations, such as Chile and Indonesia, while raising environmental standards. Second, 'urban mining'—extracting reusable critical metals from discarded batteries and old electronic waste—can create a clean domestic supply. Keeping backup suppliers costs extra money upfront, much like buying home insurance, but it protects economies from sudden shocks.",
        gistVi: "Thay vì tự cung tự cấp hoàn toàn, các nhà kinh tế khuyên nên đa dạng hóa đối tác tinh luyện và đẩy mạnh 'khai mỏ đô thị' — tái chế kim loại quý từ pin cũ và rác điện tử."
      }
    ],
    questions: [
      {
        id: "q1",
        type: "tfng",
        prompt: "Extreme-ultraviolet lithography machines used to print leading-edge chips are currently manufactured by dozens of competing firms across every continent.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 1,
        para: "B",
        explainVi: "Đoạn B khẳng định máy quang khắc cực tím (EUV) được lắp ráp độc quyền tại Hà Lan ('assembled exclusively in the Netherlands') chứ không phải hàng chục công ty khắp các châu lục → FALSE."
      },
      {
        id: "q2",
        type: "tfng",
        prompt: "Constructing an advanced semiconductor factory in the United States or Germany is substantially more expensive than in established East Asian hubs.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 0,
        para: "C",
        explainVi: "Đoạn C nêu rõ xây fab bán dẫn ở Arizona hay Đức tốn kém hơn khoảng 30–50% so với các cụm công nghiệp Đông Á do thiếu kỹ thuật viên chuyên sâu và hệ sinh thái nhà cung ứng tại chỗ → TRUE."
      },
      {
        id: "q3",
        type: "mcq",
        prompt: "Where does the sharpest geographic concentration in critical minerals lie according to Paragraph D?",
        options: [
          "A. Raw underground geological reserves, which exist in only one country",
          "B. Midstream chemical refining and processing rather than raw mining alone",
          "C. Deep-sea mining platforms in the Atlantic Ocean",
          "D. Retail battery disposal bins in European supermarkets"
        ],
        answer: 1,
        para: "D",
        explainVi: "Đoạn D phân biệt rõ: quặng thô phân bố ở nhiều châu lục, nhưng khâu tinh luyện hóa chất trung nguồn và chế tạo nam châm mới tập trung áp đảo 60–90% ở một quốc gia → Đáp án B."
      },
      {
        id: "q4",
        type: "mcq",
        prompt: "What does 'urban mining' in Paragraph E refer to?",
        options: [
          "A. Digging lithium shafts beneath metropolitan subway tunnels",
          "B. Extracting reusable critical metals from discarded batteries and electronic waste",
          "C. Trading mineral futures contracts on city stock exchanges",
          "D. Relocating semiconductor engineers from suburbs to downtown apartments"
        ],
        answer: 1,
        para: "E",
        explainVi: "Đoạn E giải thích trực tiếp 'urban mining' là tái chế thủy luyện từ pin hết hạn và rác thải điện tử để thu hồi nguồn cung kim loại thứ cấp trong nước → Đáp án B."
      }
    ]
  },
  {
    id: "eco-18",
    num: 7,
    category: "economics",
    tag: "Kinh tế học Hành vi & Thị trường Thuật toán",
    sourceNote: "Behavioral & Industrial Economics 2025–2026 · Agentic Commerce & Algorithmic Pricing",
    passage: 2,
    band: "Passage 2 · 6.5–7.5",
    metrics: { score: 87.4, avgSent: 26.3, c1c2Pct: 12.8, b2PlusPct: 31.1, fkGrade: 18.2 },
    topicId: 9,
    title: "When Algorithms Do the Shopping: Behavioral Economics in the Age of AI Agents",
    titleVi: "Khi thuật toán đi mua sắm: Kinh tế học hành vi trong kỷ nguyên tác nhân AI",
    paragraphs: [
      {
        id: "A",
        text: "Behavioral economics rose to global prominence through the research of Daniel Kahneman, Amos Tversky, and Richard Thaler, who proved that real shoppers rarely act like cold, rational calculators. Human consumers fall into predictable cognitive biases: we overvalue items placed at eye level, anchor on crossed-out 'sale' prices, procrastinate canceling unused gym subscriptions, and pay hefty brand premiums out of habit. Between 2025 and 2026, however, economists began investigating a major structural shift dubbed 'agentic commerce': what happens when autonomous AI agents do the shopping on our behalf?",
        gistVi: "Kinh tế học hành vi truyền thống xoay quanh thiên kiến tâm lý con người khi mua sắm, nhưng giai đoạn 2025–2026 mở ra chương mới gọi là 'thương mại tác nhân' khi trợ lý AI mua hàng thay con người."
      },
      {
        id: "B",
        text: "When a consumer delegates routine errands—rebooking delayed flights, comparing car insurance deductibles, or ordering weekly groceries—to a personal AI agent, traditional behavioral marketing tricks stop working overnight. A buyer-side AI agent never grows tired reading forty pages of fine-print exclusions, remains completely immune to celebrity advertisements or artificial countdown timers ('Only 2 rooms left!'), and calculates total lifecycle cost including hidden shipping and cancellation fees in milliseconds. Early market simulations indicate that AI buyers make demand far more sensitive to price, squeezing unfair profits that firms previously extracted from forgetful customers.",
        gistVi: "Tác nhân AI không biết mệt khi đọc điều khoản chữ nhỏ, miễn nhiễm với chiêu trò đếm ngược khan hiếm giả tạo và tính tổng chi phí ẩn chỉ trong mili-giây."
      },
      {
        id: "C",
        text: "Yet sellers are deploying sophisticated pricing software of their own, sparking high-speed algorithmic arms races and raising concerns over silent price-fixing. Under classic antitrust law, proving illegal collusion required showing that rival managers secretly met or exchanged explicit messages agreeing not to undercut each other. Recent studies of retail gasoline stations and apartment rental software reveal a harder challenge: competing reinforcement-learning pricing algorithms, instructed simply to maximize long-term profit, can independently learn to keep prices elevated and punish price-cutters instantly without humans ever exchanging a single message.",
        gistVi: "Tuy nhiên ở phía người bán, các thuật toán định giá tự học cũng có thể tự phát giữ giá cao đồng loạt mà không cần con người bàn bạc mật, gây khó khăn lớn cho luật chống độc quyền."
      },
      {
        id: "D",
        text: "A second vulnerability involves the incentives of the consumer's AI shopping assistant itself. Just as search engines monetize top rankings through sponsored links, a dominant AI assistant could subtly steer recommendations toward merchants paying higher affiliate commissions while wrapping the advice in polite, persuasive language. Behavioral studies warn of 'automation complacency': once a reliable AI assistant makes ten sensible routine purchases, human owners stop scrutinizing whether the eleventh recommendation favors a paying sponsor.",
        gistVi: "Rủi ro thứ hai là 'tự mãn với tự động hóa': người dùng quá tin tưởng trợ lý AI nên dễ bị dẫn dắt ngầm sang nhãn hàng trả hoa hồng quảng cáo cao."
      },
      {
        id: "E",
        text: "Competition regulators in Europe, North America, and Asia are consequently updating consumer-protection rules for algorithmic markets. Proposed safeguards include mandatory machine-readable fee disclosures so independent consumer AI agents cannot be blocked when comparing prices across websites, alongside strict labeling of paid sponsorships and regulatory 'sandboxes' that audit pricing code for collusive behavior. Whether AI agents create fairer markets or entrench digital gatekeepers will depend on whose interests the software is legally bound to serve.",
        gistVi: "Các cơ quan quản lý đang cập nhật luật: buộc công khai biểu phí chuẩn máy đọc được, minh bạch tài trợ trong trợ lý AI và kiểm tra thuật toán định giá sớm."
      }
    ],
    questions: [
      {
        id: "q1",
        type: "tfng",
        prompt: "Buyer-side AI shopping agents are easily tricked by artificial countdown timers and celebrity advertisements.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 1,
        para: "B",
        explainVi: "Đoạn B khẳng định rõ người mua thuật toán hoàn toàn miễn nhiễm với quảng cáo người nổi tiếng hay đồng hồ đếm ngược khan hiếm ('immune to flashy celebrity endorsements or scarcity countdown timers') → FALSE."
      },
      {
        id: "q2",
        type: "tfng",
        prompt: "Competing reinforcement-learning pricing algorithms can maintain elevated prices without human managers ever exchanging explicit price-fixing messages.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 0,
        para: "C",
        explainVi: "Đoạn C mô tả hiện tượng 'thông đồng thuật toán ngầm': các thuật toán học tăng cường độc lập tự học cách giữ giá cao nhân tạo mà không cần giao tiếp thỏa thuận trực tiếp → TRUE."
      },
      {
        id: "q3",
        type: "mcq",
        prompt: "What does 'automation complacency' in Paragraph D describe?",
        options: [
          "A. Software engineers refusing to update old smartphone operating systems",
          "B. Consumers trusting a reliable AI assistant so much that they stop scrutinizing whether a specific recommendation favors a paying sponsor",
          "C. Retail stores closing physical checkout lanes during holidays",
          "D. Factories slowing down assembly lines to conserve electricity"
        ],
        answer: 1,
        para: "D",
        explainVi: "Đoạn D giải thích 'automation complacency': sau khi trợ lý AI mua đúng ý 10 lần, con người hiếm khi kiểm tra lại gợi ý lần thứ 11, mở kẽ hở cho việc điều hướng ngầm sang nhà tài trợ → Đáp án B."
      },
      {
        id: "q4",
        type: "mcq",
        prompt: "Why are regulators proposing mandatory machine-readable fee disclosures in Paragraph E?",
        options: [
          "A. To prevent independent consumer AI agents from being locked out when comparing prices",
          "B. To help companies hide shipping surcharges until the final payment screen",
          "C. To ban consumers from canceling streaming subscriptions online",
          "D. To replace antitrust courts with private marketing agencies"
        ],
        answer: 0,
        para: "E",
        explainVi: "Đoạn E nêu rõ quy định công bố phí chuẩn máy đọc được nhằm đảm bảo các tác nhân AI độc lập của người tiêu dùng không bị chặn bởi rào cản chống quét dữ liệu khi so sánh giá → Đáp án A."
      }
    ]
  },
  {
    id: "sci-08",
    num: 8,
    category: "science",
    tag: "Thiên văn & Vũ trụ",
    sourceNote: "Vera C. Rubin Observatory First Light & JWST Early-Universe Discoveries",
    passage: 2,
    band: "Passage 2 · 6.5–7.5",
    metrics: { score: 89.3, avgSent: 25.6, c1c2Pct: 15.2, b2PlusPct: 32.0, fkGrade: 16.7 },
    topicId: 2,
    title: "Cosmic Time-Lapse: How JWST and the Rubin Observatory Are Rewriting Astrophysics",
    titleVi: "Thước phim tua nhanh vũ trụ: Kính JWST và Đài quan sát Rubin viết lại vật lý thiên văn",
    paragraphs: [
      {
        id: "A",
        text: "Modern astronomy is entering a golden era powered by two complementary observatories that examine the cosmos in fundamentally different ways. Orbiting a million miles from Earth in frigid deep space, the James Webb Space Telescope operates like an ultra-sharp infrared magnifying glass, zooming tightly onto faint, ancient galaxies born only a few hundred million years after the Big Bang. High on Chile's arid Cerro Pachón mountain peak, by contrast, the newly operational Vera C. Rubin Observatory acts like a relentless wide-angle cinema camera whose 3,200-megapixel digital sensor photographs the entire southern sky every few nights.",
        gistVi: "Thiên văn học hiện đại kết hợp hai 'người khổng lồ' bổ trợ nhau: kính hồng ngoại JWST soi sâu vào các thiên hà sơ khai, còn Đài quan sát Rubin chụp toàn cảnh bầu trời phương Nam mỗi vài đêm."
      },
      {
        id: "B",
        text: "Together, these instruments are challenging long-held cosmological models of early galaxy growth. Prior to JWST's surveys, standard computer simulations predicted that the infant universe—under four hundred million years old—should harbor only dim clumps of gas slowly forming tiny young galaxies. Instead, JWST repeatedly uncovered surprisingly luminous, massive galaxies alongside supermassive black holes millions of times heavier than our Sun. Rather than discarding the Big Bang theory itself, astrophysicists are revising models of early star-formation efficiency, proposing that pure hydrogen clouds collapsed into bright starbursts much faster than expected.",
        gistVi: "JWST gây bất ngờ lớn khi phát hiện những thiên hà sáng chói và hố đen siêu khối lượng xuất hiện quá sớm sau Big Bang, buộc giới khoa học điều chỉnh mô hình hình thành sao sơ khai."
      },
      {
        id: "C",
        text: "While JWST dissects ancient cosmic snapshots, the Rubin Observatory turns sky mapping into a decade-long high-definition time-lapse film. Automated algorithms compare each newly captured wide-angle sky image against baseline reference maps in real time, flagging up to ten million 'transient alerts' every night—from exploding supernovae to previously unseen asteroids crossing our solar system. Within its initial operational phase alone, Rubin is projected to multiply humanity's catalog of tracked near-Earth asteroids and distant icy worlds severalfold.",
        gistVi: "Đài quan sát Rubin biến thiên văn học thành 'phim tua nhanh', phát hiện tới 10 triệu biến cố mỗi đêm từ siêu tân tinh phát nổ đến các tiểu hành tinh gần Trái Đất."
      },
      {
        id: "D",
        text: "Perhaps the grandest question linking both observatories is the nature of dark energy, the mysterious repulsive force driving the accelerated expansion of space. For twenty-five years, cosmologists treated dark energy as an unchanging constant across cosmic history. However, precision maps of millions of galaxy clusters—combined with Rubin's measurements of weak gravitational lensing caused by dark matter—hint that dark energy's strength might actually be weakening subtly over billions of years, a finding that would reshape fundamental physics.",
        gistVi: "Dữ liệu thấu kính hấp dẫn từ Rubin và các khảo sát thiên hà hé lộ khả năng 'năng lượng tối' không hề bất biến mà có thể đang suy yếu dần theo thời gian."
      },
      {
        id: "E",
        text: "Closer to our cosmic neighborhood, JWST is advancing exoplanet science by analyzing starlight filtered through thin planetary atmospheres. Detecting chemical fingerprints of methane, carbon dioxide, and water vapor on distant planets has sharpened criteria for habitability, even as violent stellar flares from nearby host stars threaten to strip rocky atmospheres away. Meanwhile, on Earth, astronomers confront a man-made challenge: bright reflective trails from thousands of low-Earth-orbit communications satellites streak across Rubin's giant mirror, requiring sophisticated software masking to preserve clean astronomical data.",
        gistVi: "JWST còn phân tích khí quyển ngoại hành tinh tìm dấu hiệu sự sống, trong khi Đài quan sát Rubin dưới mặt đất phải dùng phần mềm lọc vệt sáng của hàng nghìn vệ tinh viễn thông tầm thấp."
      }
    ],
    questions: [
      {
        id: "q1",
        type: "tfng",
        prompt: "JWST's discovery of bright early galaxies forced astronomers to completely abandon the Big Bang theory.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 1,
        para: "B",
        explainVi: "Đoạn B khẳng định rõ: thay vì bác bỏ khuôn khổ Big Bang ('Rather than discarding the Big Bang framework itself'), các nhà vật lý thiên văn đang hiệu chỉnh lý thuyết về hiệu suất hình thành sao sơ khai → FALSE."
      },
      {
        id: "q2",
        type: "tfng",
        prompt: "The Vera C. Rubin Observatory is located on a high, dry mountain peak in Chile.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 0,
        para: "A",
        explainVi: "Đoạn A viết: 'High atop Chile's arid Cerro Pachón mountain... the newly operational Vera C. Rubin Observatory' → TRUE."
      },
      {
        id: "q3",
        type: "mcq",
        prompt: "How does the Rubin Observatory generate millions of 'transient alerts' each night?",
        options: [
          "A. By bouncing radar beams off distant galaxies beyond the Milky Way",
          "B. By matching newly captured wide-angle sky images against baseline reference maps",
          "C. By collecting physical dust particles falling into Earth's upper atmosphere",
          "D. By launching miniature space probes toward passing comets"
        ],
        answer: 1,
        para: "C",
        explainVi: "Đoạn C giải thích thuật toán tự động so sánh ảnh bầu trời góc rộng mới chụp với bản đồ tham chiếu gốc theo thời gian thực để báo hiệu các vật thể thay đổi độ sáng hoặc vị trí → Đáp án B."
      },
      {
        id: "q4",
        type: "mcq",
        prompt: "What human-made challenge threatens ground-based sky surveys like Rubin's in Paragraph E?",
        options: [
          "A. Thermal exhaust plumes from commercial passenger aircraft",
          "B. Reflective trails left across exposures by swarms of low-Earth-orbit satellites",
          "C. Radio interference from deep-sea internet cables",
          "D. Vibrations from nearby geothermal power stations"
        ],
        answer: 1,
        para: "E",
        explainVi: "Đoạn E nêu thách thức nhân tạo là các vệt sáng từ hàng nghìn vệ tinh viễn thông quỹ đạo thấp băng qua gương kính của Rubin → Đáp án B."
      }
    ]
  },
  {
    id: "eco-16",
    num: 9,
    category: "economics",
    tag: "Kinh tế Tiền tệ & Ngân hàng Trung ương",
    sourceNote: "Bank for International Settlements (BIS) · CBDCs, Tokenization & Two-Tier Money",
    passage: 2,
    band: "Passage 2 · 6.5–7.5",
    metrics: { score: 90.2, avgSent: 28.0, c1c2Pct: 13.7, b2PlusPct: 28.6, fkGrade: 18.4 },
    topicId: 11,
    title: "Reinventing Money: Central Bank Digital Currencies and the Disintermediation Dilemma",
    titleVi: "Định hình lại tiền tệ: Tiền kỹ thuật số Ngân hàng Trung ương và bài toán rút vốn ngân hàng",
    paragraphs: [
      {
        id: "A",
        text: "Whenever consumers tap a smartphone or swipe a debit card to buy morning coffee, money appears thoroughly digital already. Yet beneath that convenient interface lies a crucial legal distinction inside modern two-tier monetary systems. Physical banknotes in a wallet are direct, risk-free liabilities of the central bank, whereas numbers inside a commercial bank app represent private claims on a profit-seeking lender backed by deposit insurance and fractional reserves. As physical cash usage plummets from Sweden to China and privately issued dollar-pegged stablecoins proliferate across crypto networks, over ninety percent of the world's central banks have launched research or live pilots into Central Bank Digital Currencies, or CBDCs.",
        gistVi: "Tiền trên ứng dụng ngân hàng thực chất là nợ của ngân hàng thương mại chứ không phải tiền mặt trực tiếp của Ngân hàng Trung ương (NHTW); sự suy giảm tiền mặt và làn sóng stablecoin đã thúc đẩy hơn 90% NHTW nghiên cứu CBDC."
      },
      {
        id: "B",
        text: "Monetary economists distinguish sharply between two flavors of digital sovereign money: 'wholesale' and 'retail' CBDCs. Wholesale CBDCs operate behind the scenes among financial institutions, settling interbank securities, foreign-exchange swaps, and tokenized government bonds instantaneously on unified programmable ledgers—eliminating multi-day settlement delays and correspondent-banking fees that still burden cross-border remittances. Retail CBDCs, by contrast, place digital central-bank cash directly into citizens' smartphones, promising low-cost public payment rails that cannot be monopolized by giant card networks or private Big Tech wallets.",
        gistVi: "Kinh tế học phân biệt rạch ròi 'CBDC bán buôn' (thanh toán tức thời liên ngân hàng và xuyên biên giới) với 'CBDC bán lẻ' (tiền số NHTW nằm trực tiếp trong ví điện thoại người dân)."
      },
      {
        id: "C",
        text: "Why, then, have major central banks approached retail CBDC rollouts with extreme caution? Research synthesized by the Bank for International Settlements highlights a systemic hazard known as 'commercial bank disintermediation.' Commercial banks fund home mortgages and small-business loans primarily through sticky, low-interest household deposits. If citizens can hold unlimited sums of completely risk-free central-bank digital cash on their phones, routine depositors might drain commercial accounts—forcing banks to rely on costlier wholesale funding and raising borrowing interest rates across the real economy. Worse still, during a rumor-driven financial panic, millions of savers could trigger a 'digital bank run' into CBDCs with three thumb taps at midnight.",
        gistVi: "Rủi ro lớn nhất của CBDC bán lẻ là 'phi trung gian hóa ngân hàng': người dân rút tiền gửi khỏi ngân hàng thương mại chuyển sang ví NHTW an toàn tuyệt đối, làm cạn vốn cho vay nền kinh tế và dễ kích hoạt rút tiền ồ ạt trong vài giây khi có tin đồn."
      },
      {
        id: "D",
        text: "To neutralize that instability while preserving public monetary sovereignty, central-bank architects in the Eurozone, Britain, and Asia have converged on 'tiered' safeguard designs. Proposed digital euro and digital pound frameworks pay zero interest on retail CBDC balances—treating them strictly as transactional cash rather than an investment vehicle—and impose strict individual holding caps, such as three thousand euros per citizen, with automated 'waterfall' mechanisms linking excess incoming payments back into the user's commercial bank account. Equally contentious are privacy guarantees: democratic legislatures increasingly demand offline payment capabilities so small everyday purchases remain anonymous like paper bills, while still screening large transfers against money laundering.",
        gistVi: "Để hóa giải rủi ro, các NHTW thiết kế trần nắm giữ (như tối đa 3.000 euro), không trả lãi cho CBDC bán lẻ và tích hợp thanh toán ngoại tuyến bảo vệ quyền riêng tư cho giao dịch nhỏ."
      },
      {
        id: "E",
        text: "Real-world adoption patterns through 2026 have also humbled early techno-optimism. In jurisdictions where instant fast-payment systems—such as Brazil's Pix or India's Unified Payments Interface—already allow citizens to transfer commercial bank money in seconds for zero fees, retail consumers see little everyday reason to switch to a separate CBDC wallet. Consequently, BIS economists increasingly envision the future monetary architecture not as a solitary CBDC monopoly, but as a 'unified ledger' ecosystem where tokenized commercial bank deposits, regulated fast-payment rails, and wholesale central-bank reserves interoperate seamlessly.",
        gistVi: "Thực tế tới năm 2026 cho thấy nơi nào đã có hệ thống chuyển khoản nhanh miễn phí (như Pix của Brazil hay UPI của Ấn Độ), người dân ít mặn mà với ví CBDC riêng; tương lai nghiêng về 'sổ cái hợp nhất' kết nối tiền gửi mã hóa và dự trữ NHTW."
      }
    ],
    questions: [
      {
        id: "q1",
        type: "tfng",
        prompt: "Balances shown inside a standard commercial banking smartphone app are direct legal liabilities of the central bank, identical to paper banknotes.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 1,
        para: "A",
        explainVi: "Đoạn A phân biệt rõ tiền giấy là nghĩa vụ trực tiếp không rủi ro của NHTW, còn con số trên app ngân hàng thương mại là khoản nợ tư nhân của tổ chức tín dụng ('private claims on a profit-seeking lender') → FALSE."
      },
      {
        id: "q2",
        type: "tfng",
        prompt: "Proposed European retail CBDC designs pay zero interest and cap how much digital central-bank currency an individual can hold.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 0,
        para: "D",
        explainVi: "Đoạn D nêu rõ khung thiết kế đồng euro số không trả lãi suất ('pay zero interest') và áp trần nắm giữ cá nhân nghiêm ngặt (ví dụ 3.000 euro) → TRUE."
      },
      {
        id: "q3",
        type: "mcq",
        prompt: "Why could unlimited, unrestricted retail CBDC accounts raise mortgage and business loan rates in the broader economy?",
        options: [
          "A. Central banks charge commercial lenders a fifty percent tax on digital wallets",
          "B. Households shifting deposits out of commercial banks would force lenders to seek more expensive funding sources",
          "C. Paper banknotes are cheaper to print than maintaining cloud servers",
          "D. Wholesale CBDCs prohibit international foreign-exchange transactions"
        ],
        answer: 1,
        para: "C",
        explainVi: "Đoạn C giải thích nếu người dân rút tiền gửi lãi suất thấp khỏi ngân hàng thương mại sang giữ CBDC không giới hạn, ngân hàng mất nguồn vốn rẻ để cho vay mua nhà/kinh doanh và buộc phải huy động vốn bán buôn đắt đỏ hơn → Đáp án B."
      },
      {
        id: "q4",
        type: "mcq",
        prompt: "What real-world lesson emerged from countries with successful instant payment networks like Brazil's Pix and India's UPI?",
        options: [
          "A. Citizens immediately abandoned fast-payment apps as soon as retail CBDCs launched",
          "B. When instant, zero-fee bank transfers already work smoothly, everyday users feel little urgency to adopt a separate retail CBDC",
          "C. Instant payment systems only function for corporate bond trading",
          "D. Physical cash circulation tripled after instant payments were introduced"
        ],
        answer: 1,
        para: "E",
        explainVi: "Đoạn E chỉ ra ở những nơi hệ thống thanh toán nhanh như Pix (Brazil) hay UPI (Ấn Độ) đã chuyển tiền trong vài giây hoàn toàn miễn phí, người tiêu dùng thấy ít lý do thiết thực để đổi sang ví CBDC bán lẻ riêng biệt → Đáp án B."
      }
    ]
  },
  {
    id: "eco-19",
    num: 10,
    category: "economics",
    tag: "Tài chính Khí hậu & Thị trường Bảo hiểm",
    sourceNote: "Financial Stability Board, ECB & Allianz Climate Risk Macroeconomics",
    passage: 2,
    band: "Passage 2 · 6.5–7.5",
    metrics: { score: 90.3, avgSent: 31.3, c1c2Pct: 11.3, b2PlusPct: 27.8, fkGrade: 19.1 },
    topicId: 5,
    title: "Uninsurable Horizons: How Physical Climate Risk Is Repricing Real Estate",
    titleVi: "Đường chân trời không thể bảo hiểm: Rủi ro khí hậu vật lý đang định giá lại bất động sản thế nào?",
    paragraphs: [
      {
        id: "A",
        text: "For decades, discussions of climate economics revolved around distant end-of-century warming projections or gradual transition risks facing coal and oil companies. Between 2024 and 2026, however, financial regulators highlighted a much faster warning signal hitting household budgets immediately: residential property insurance. Unlike fixed thirty-year home mortgages, property insurance policies are repriced every twelve months, so as warmer oceans and drier forests intensify severe storms, urban flash floods, and wildfires across North America, southern Europe, and Australia, insurance bills respond first.",
        gistVi: "Khác với khoản vay mua nhà 30 năm, hợp đồng bảo hiểm nhà ở được định giá lại mỗi 12 tháng; bão lũ và cháy rừng giai đoạn 2024–2026 đang biến ngành bảo hiểm thành còi báo động sớm nhất."
      },
      {
        id: "B",
        text: "Traditional actuarial models estimated disaster odds by looking backward at fifty or a hundred years of local weather records—an approach that falters when baseline climate probabilities shift non-linearly, a statistical challenge called 'non-stationarity.' Compounded by steeper lumber, roofing, and skilled-labor costs to repair storm damage, global reinsurers—the wholesale firms that insure primary insurance companies against catastrophic disasters—sharply raised their renewal rates, prompting local insurers either to double household premiums in risky zones or to pull back from writing new coverage.",
        gistVi: "Mô hình định phí dựa vào lịch sử 50–100 năm cũ không còn khớp khi khí hậu biến đổi phi tuyến tính ('non-stationarity'), cộng thêm chi phí sửa nhà tăng cao khiến phí bảo hiểm tăng vọt."
      },
      {
        id: "C",
        text: "This insurance pullback sends immediate shockwaves through housing and bank credit markets because most mortgage lenders require homebuyers to carry hazard insurance in order to obtain and keep a long-term home loan. When private coverage disappears or annual insurance bills leap from two thousand to ten thousand dollars, prospective buyers discount what they can afford to bid, eroding property values even before any flood reaches the street. Recent housing studies across North America confirmed that sale prices in floodplains and wildfire fringes dropped measurably once local insurance premiums spiked.",
        gistVi: "Ngân hàng bắt buộc có bảo hiểm rủi ro mới cho vay thế chấp mua nhà, nên khi phí bảo hiểm tăng vọt, giá nhà tại vùng nguy cơ sụt giảm ngay cả trước khi bão lũ xảy ra."
      },
      {
        id: "D",
        text: "Hoping to shield voters from sudden rate shocks, several governments expanded public insurance programs or capped private premium increases below true risk levels. Economists caution that artificial price suppression creates serious unintended consequences: keeping insurance artificially cheap in storm-prone coastal zones or dry forest fringes mutes natural market price signals, encouraging developers to keep building vulnerable homes in dangerous areas while quietly shifting trillions of dollars in future disaster liabilities onto taxpayers.",
        gistVi: "Việc chính phủ kìm giá phí bảo hiểm dưới mức rủi ro thực làm mờ tín hiệu cảnh báo, khuyến khích tiếp tục xây nhà ở vùng nguy hiểm và dồn gánh nặng nợ tiềm tàng lên người nộp thuế."
      },
      {
        id: "E",
        text: "Financial economists argue that public policy should reward verified physical adaptation rather than hiding risk behind subsidized rates. When municipalities and insurers offer guaranteed premium discounts for fire-resistant roofs, brush clearance around walls, elevated electrical equipment, and neighborhood flood-retention wetlands, every dollar invested in physical mitigation saves an estimated four to seven dollars in avoided disaster losses. Accurate risk pricing can sting in the short run, yet muffling a smoke alarm never extinguishes the fire.",
        gistVi: "Giải pháp bền vững là giảm phí minh bạch cho nhà nâng cấp chống chịu thiên tai (mái chống cháy, hạ tầng thoát lũ), nơi 1 đô la phòng ngừa tiết kiệm 4–7 đô la thiệt hại."
      }
    ],
    questions: [
      {
        id: "q1",
        type: "tfng",
        prompt: "Standard residential property insurance contracts are locked at a fixed price for thirty years, just like fixed-rate mortgages.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 1,
        para: "A",
        explainVi: "Đoạn A đối lập rõ ràng: khác với khoản vay thế chấp 30 năm, hợp đồng bảo hiểm nhà ở được định giá lại mỗi 12 tháng ('repriced every twelve months') → FALSE."
      },
      {
        id: "q2",
        type: "tfng",
        prompt: "Most mortgage lenders require homebuyers to carry hazard insurance in order to obtain and keep a long-term home loan.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 0,
        para: "C",
        explainVi: "Đoạn C nêu rõ ở hầu hết các nền kinh tế phát triển, ngân hàng yêu cầu người vay duy trì bảo hiểm rủi ro toàn diện như điều kiện tiên quyết của khoản vay thế chấp → TRUE."
      },
      {
        id: "q3",
        type: "mcq",
        prompt: "Why do traditional backward-looking actuarial models struggle to price current climate hazards in Paragraph B?",
        options: [
          "A. Weather records were never collected prior to 2010",
          "B. Climate probabilities are shifting non-linearly ('non-stationarity'), making past averages unreliable guides to current risk",
          "C. Construction materials have fallen in price by eighty percent",
          "D. Reinsurance companies are prohibited by law from using computers"
        ],
        answer: 1,
        para: "B",
        explainVi: "Đoạn B giải thích hiện tượng 'non-stationarity': xác suất khí hậu nền đang dịch chuyển phi tuyến tính khiến trung bình lịch sử 50–100 năm trước không còn phản ánh đúng rủi ro hiện tại → Đáp án B."
      },
      {
        id: "q4",
        type: "mcq",
        prompt: "What unintended consequence arises when governments artificially cap insurance rates below true risk levels in hazardous zones?",
        options: [
          "A. Developers stop building houses anywhere near coastlines",
          "B. Muted price signals encourage continued construction in dangerous areas while shifting massive future liabilities onto taxpayers",
          "C. Homeowners voluntarily spend more money on fireproof roofs",
          "D. Reinsurers offer free coverage to neighboring countries"
        ],
        answer: 1,
        para: "D",
        explainVi: "Đoạn D cảnh báo việc kìm giá bảo hiểm dưới mức rủi ro thực làm tê liệt tín hiệu giá thị trường, tiếp tay cho việc xây dựng ở vùng nguy hiểm và đẩy nghĩa vụ nợ tiềm tàng khổng lồ sang người nộp thuế → Đáp án B."
      }
    ]
  },
  {
    id: "eco-13",
    num: 11,
    category: "economics",
    tag: "Kinh tế học Công nghệ & Năng suất",
    sourceNote: "NBER & Macroeconomic Productivity Studies · Generative AI & Solow's Paradox",
    passage: 2,
    band: "Passage 2 · 6.5–7.5",
    metrics: { score: 91.6, avgSent: 29.1, c1c2Pct: 11.3, b2PlusPct: 31.9, fkGrade: 19.7 },
    topicId: 3,
    title: "The AI Productivity Paradox: Why Trillion-Dollar Tech Takes Time to Lift GDP",
    titleVi: "Nghịch lý năng suất AI: Vì sao đầu tư nghìn tỷ đô chưa lập tức làm bùng nổ GDP?",
    paragraphs: [
      {
        id: "A",
        text: "In 1987, Nobel laureate Robert Solow famously observed that people could see the computer age everywhere except in national productivity statistics. Nearly four decades later, macroeconomists tracking generative artificial intelligence confront a strikingly familiar puzzle. Between 2023 and 2026, corporations invested hundreds of billions of dollars into AI processors, cloud data centers, and enterprise software, while workplace trials showed programmers, customer-support agents, and paralegals completing individual tasks twenty to forty percent faster; yet official GDP productivity growth across North America, Europe, and Asia rose only modestly.",
        gistVi: "Giống 'nghịch lý máy tính' năm 1987 của Robert Solow, dù doanh nghiệp chi hàng trăm tỷ USD cho AI và thử nghiệm cá nhân tăng tốc 20–40%, thống kê năng suất tổng thể quốc gia mới nhích nhẹ."
      },
      {
        id: "B",
        text: "Economists Erik Brynjolfsson, Daniel Rock, and Chad Syverson explain this lag through the 'Productivity J-Curve' seen in earlier general-purpose technologies like steam power and electricity. When factory owners first purchased electric motors in the 1890s, managers simply swapped out a central steam engine while keeping the old multi-story layout of overhead drive shafts and leather belts, so factory productivity barely moved for twenty years. Output surged only after industrial engineers flattened factories into single-story assembly lines where compact motors powered each workstation independently.",
        gistVi: "Lý thuyết 'Đường cong chữ J năng suất' giải thích điều này qua lịch sử điện khí hóa: khi nhà máy chỉ thay động cơ hơi nước bằng động cơ điện mà giữ nguyên dây chuyền cũ, năng suất dậm chân tại chỗ suốt 20 năm."
      },
      {
        id: "C",
        text: "Most enterprises deploying AI today sit near the bottom trough of that J-curve, bolting chatbots onto legacy workflows—such as drafting longer emails that coworkers then use another AI tool to summarize—without redesigning core approval or supply-chain bottlenecks. Simultaneously, firms spend heavily on unmeasured 'intangible investments,' including cleaning fragmented databases, retraining managers, updating cybersecurity governance, and auditing machine errors. Because national accounts record hardware outlays immediately while missing internal organizational learning, measured productivity growth looks temporarily flat.",
        gistVi: "Hiện tại đa số công ty mới gắn tạm AI vào quy trình cũ và phải tốn chi phí vô hình lớn để chuẩn hóa dữ liệu, đào tạo nhân sự và kiểm soát lỗi."
      },
      {
        id: "D",
        text: "Controlled workplace experiments also reveal an intriguing distributional shift inside offices compared with 1990s computerization, which mainly rewarded senior analysts while cutting routine clerical roles. Generative AI, by contrast, frequently narrows skill gaps within a profession: junior programmers, novice call-center staff, and non-native English writers capture the largest speed and quality boosts because the model encodes best practices from top performers, whereas senior experts gain smaller incremental boosts and spend extra effort verifying subtle machine mistakes.",
        gistVi: "Khác với phần mềm thập niên 1990 ưu ái chuyên gia cấp cao, AI tạo sinh giúp nhân viên mới thu hẹp khoảng cách kỹ năng nhanh nhất, trong khi chuyên gia kỳ cựu tăng ít hơn."
      },
      {
        id: "E",
        text: "Leading economists remain divided over the scale of gains over the coming decade. Skeptics note that many essential jobs—such as nursing, plumbing, and eldercare—depend on physical dexterity in unstructured spaces and human accountability where chatbots help very little. Optimists counter that if AI accelerates scientific R&D itself in pharmaceuticals, battery chemistry, and chip engineering, even a sustained half-percent rise in annual productivity growth will compound powerfully over time, easing fiscal strains in aging societies.",
        gistVi: "Giới kinh tế chia làm hai luồng dự báo: phe thận trọng chỉ ra giới hạn ở nghề tay chân và chăm sóc, còn phe lạc quan kỳ vọng AI thúc đẩy chính nghiên cứu khoa học để tạo lãi kép năng suất."
      }
    ],
    questions: [
      {
        id: "q1",
        type: "tfng",
        prompt: "Replacing central steam engines with electric motors in the 1890s immediately doubled factory productivity within the first two years.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 1,
        para: "B",
        explainVi: "Đoạn B nêu rõ khi nhà máy thập niên 1890 chỉ thay động cơ hơi nước bằng động cơ điện trên bố cục cũ, năng suất hầu như không nhúc nhích suốt 20 năm ('productivity barely moved for twenty years') → FALSE."
      },
      {
        id: "q2",
        type: "tfng",
        prompt: "Workplace experiments show that junior employees often gain larger relative performance boosts from generative AI than top senior experts.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 0,
        para: "D",
        explainVi: "Đoạn D khẳng định nhân viên mới, lập trình viên trẻ và người viết không phải bản xứ đạt mức tăng tốc độ/chất lượng lớn nhất, trong khi chuyên gia kỳ cựu tăng ít hơn → TRUE."
      },
      {
        id: "q3",
        type: "mcq",
        prompt: "Why does the 'Productivity J-Curve' initially depress or flatten measured productivity growth?",
        options: [
          "A. Governments tax new computer hardware at punitive rates",
          "B. Firms spend heavily on unmeasured organizational restructuring and data preparation before redesigned workflows pay off",
          "C. Employees take longer vacations whenever new software is installed",
          "D. National statistical agencies refuse to survey technology companies"
        ],
        answer: 1,
        para: "C",
        explainVi: "Đoạn C giải thích doanh nghiệp phải đổ nguồn lực lớn vào 'đầu tư vô hình' chưa được đo lường trong GDP (làm sạch dữ liệu, đào tạo lại, tái thiết quy trình) trước khi gặt hái thành quả → Đáp án B."
      },
      {
        id: "q4",
        type: "mcq",
        prompt: "On what grounds do optimistic economists expect significant long-run economic gains in Paragraph E?",
        options: [
          "A. AI robots have already replaced all residential plumbers and nurses",
          "B. If AI speeds up scientific R&D in fields like medicine and materials, even modest annual productivity increases compound powerfully",
          "C. Data centers generate excess heat that eliminates winter heating bills nationwide",
          "D. Corporate compliance departments are no longer legally required"
        ],
        answer: 1,
        para: "E",
        explainVi: "Đoạn E nêu lập luận của phe lạc quan: nếu AI thúc đẩy chính tốc độ nghiên cứu khoa học (thuốc, pin, bán dẫn), chỉ cần tăng thêm 0,5%/năm năng suất duy trì liên tục cũng tạo hiệu ứng lãi kép khổng lồ → Đáp án B."
      }
    ]
  },
  {
    id: "sci-07",
    num: 12,
    category: "science",
    tag: "Khoa học thần kinh · Bản đồ não bộ",
    sourceNote: "FlyWire Consortium & Harvard/MGH Connectome 2.0 Brain Mapping",
    passage: 2,
    band: "Passage 2 · 6.5–7.5",
    metrics: { score: 94.6, avgSent: 25.5, c1c2Pct: 17.6, b2PlusPct: 31.9, fkGrade: 16.8 },
    topicId: 9,
    title: "Wiring of the Mind: The First Complete Brain Connectomes",
    titleVi: "Sơ đồ mạch điện tâm trí: Bản đồ kết nối thần kinh toàn diện đầu tiên",
    paragraphs: [
      {
        id: "A",
        text: "Knowing every part inside a radio does little to explain how it plays music unless an engineer also possesses its wiring diagram. Neuroscience has long faced a similar dilemma: although biologists cataloged chemical neurotransmitters and broad brain zones, the complete synaptic wiring map—known as a 'connectome'—of any seeing, walking animal remained out of reach. Recently, an international consortium of neuroscientists and computer engineers completed the first full central nervous system connectome of an adult fruit fly, Drosophila melanogaster, tracing nearly one hundred and forty thousand neurons and over fifty million synapses.",
        gistVi: "Lần đầu tiên trong lịch sử, các nhà khoa học lập thành công bản đồ kết nối thần kinh (connectome) hoàn chỉnh của ruồi giấm trưởng thành với gần 140.000 nơ-ron và hơn 50 triệu khớp thần kinh."
      },
      {
        id: "B",
        text: "At first glance, an insect brain smaller than a poppy seed might appear irrelevant to human cognition, yet fruit flies display remarkably sophisticated behaviors. They navigate three-dimensional space in flight, form lasting memories of odors linked to food or danger, and make rapid directional choices. Reconstructing this circuitry required slicing a preserved fly brain into seven thousand ultrathin layers and photographing each slice under electron microscopes, after which convolutional neural networks stitched tangled branches across terabytes of images—followed by years of human proofreading to fix subtle AI tracing errors.",
        gistVi: "Dù nhỏ hơn hạt anh túc, não ruồi giấm điều khiển nhiều hành vi phức tạp; việc dựng bản đồ đòi hỏi cắt 7.000 lát siêu mỏng, chụp kính hiển vi điện tử kết hợp AI và con người hiệu đính."
      },
      {
        id: "C",
        text: "Once assembled, the digital connectome yielded immediate surprises through virtual computer simulations. Switching on simulated sugar-sensing neurons accurately triggered the exact cascade of motor neurons that extend the insect's feeding proboscis, while tracing visual pathways uncovered feedback loops that tell a walking fly to freeze when threats approach. Most unexpectedly, sensory streams such as sight, smell, and sound merge in central decision hubs much earlier than older neuroscience textbooks suggested.",
        gistVi: "Mô phỏng máy tính trên bản đồ số này dự đoán chính xác phản xạ vận động của ruồi và phát hiện các luồng giác quan hội tụ sớm hơn nhiều so với lý thuyết sách giáo khoa cũ."
      },
      {
        id: "D",
        text: "Slicing an entire human brain the same way remains impractical today, since our brain packs eighty-six billion neurons and a million times greater volume. Researchers are therefore bridging the gap from two angles: mapping cubic-millimeter fragments of human cerebral cortex donated during epilepsy surgery, while simultaneously deploying ultra-strong magnetic resonance scanners such as Connectome 2.0. Using magnetic gradients fivefold stronger than standard hospital MRI machines, Connectome 2.0 tracks microscopic water diffusion along nerve bundles to reveal fine white-matter pathways in living volunteers.",
        gistVi: "Với não người gồm 86 tỷ nơ-ron, giới nghiên cứu vừa giải mã các mẫu vỏ não cỡ milimét khối ở cấp độ nano, vừa dùng máy MRI siêu từ trường Connectome 2.0 để quan sát bó sợi chất trắng trên người sống."
      },
      {
        id: "E",
        text: "Even a complete structural wiring map, however, captures a static snapshot rather than the full symphony of thought. Chemical neuromodulators such as dopamine and serotonin bathe neural circuits dynamically, altering how strongly synapses signal without moving physical wires. Nevertheless, pairing structural connectomes with live functional recordings promises to transform psychiatry—shifting disorders like severe depression and schizophrenia away from broad trial-and-error medication toward targeted, circuit-specific treatment.",
        gistVi: "Dù bản đồ cấu trúc chưa phản ánh hết các chất dẫn truyền thần kinh biến thiên động, việc kết hợp connectome với ghi nhận chức năng hứa hẹn cách mạng hóa điều trị trầm cảm và tâm thần phân liệt."
      }
    ],
    questions: [
      {
        id: "q1",
        type: "tfng",
        prompt: "Automated AI algorithms reconstructed the entire fruit fly connectome without needing any human proofreading.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 1,
        para: "B",
        explainVi: "Đoạn B ghi rõ sau khi AI nối các nhánh trục thần kinh vẫn phải mất nhiều năm con người hiệu đính để sửa các lỗi dò vết tinh vi của AI ('followed by years of human proofreading') → FALSE."
      },
      {
        id: "q2",
        type: "tfng",
        prompt: "Connectome 2.0 uses nuclear radiation tracers rather than magnetic gradients to visualize white-matter pathways.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 1,
        para: "D",
        explainVi: "Đoạn D nêu rõ Connectome 2.0 là máy chụp cộng hưởng từ (MRI) theo dõi sự khuếch tán phân tử nước bằng từ trường mạnh gấp 5 lần, không phải chất phóng xạ hạt nhân → FALSE."
      },
      {
        id: "q3",
        type: "mcq",
        prompt: "What unexpected insight emerged from analyzing the completed Drosophila wiring map in Paragraph C?",
        options: [
          "A. Fruit flies lack dedicated motor neurons for feeding behaviors",
          "B. Different sensory inputs like sight, smell, and sound merge earlier in brain hubs than previously thought",
          "C. Visual pathways operate completely independently from movement circuits",
          "D. Adult insects regenerate half of their neurons every twenty-four hours"
        ],
        answer: 1,
        para: "C",
        explainVi: "Đoạn C nhấn mạnh phát hiện bất ngờ: các luồng thính giác, khứu giác và thị giác hội tụ sớm hơn nhiều tại các trung tâm ra quyết định so với sách giáo khoa từng mô tả → Đáp án B."
      },
      {
        id: "q4",
        type: "mcq",
        prompt: "Why does Paragraph E state that a structural connectome alone cannot explain every aspect of brain activity?",
        options: [
          "A. Synapses dissolve whenever an organism falls asleep",
          "B. Neuromodulating chemicals dynamically alter how strongly circuits signal without changing physical wiring",
          "C. Electron microscopes can only photograph surface blood vessels",
          "D. Psychiatric conditions affect only the peripheral spinal cord"
        ],
        answer: 1,
        para: "E",
        explainVi: "Đoạn E giải thích các chất điều biến thần kinh như dopamine, serotonin thay đổi trọng số truyền dẫn động mà không làm dịch chuyển dây nối vật lý → Đáp án B."
      }
    ]
  },
  {
    id: "sci-02",
    num: 13,
    category: "science",
    tag: "Sinh hóa & AI · Giải Nobel",
    sourceNote: "Nobel Prize in Chemistry · AlphaFold & De Novo Protein Design",
    passage: 2,
    band: "Passage 2 · 6.5–7.5",
    metrics: { score: 98.2, avgSent: 26.1, c1c2Pct: 16.6, b2PlusPct: 33.2, fkGrade: 18.7 },
    topicId: 2,
    title: "Cracking the Protein Code: AI Prediction and De Novo Molecular Design",
    titleVi: "Giải mã cấu trúc Protein: Trí tuệ nhân tạo và kỷ nguyên thiết kế phân tử mới",
    paragraphs: [
      {
        id: "A",
        text: "Proteins are the indispensable working molecules inside every living cell, catalyzing chemical reactions, transporting oxygen through blood, and defending tissues against invading pathogens. Each protein begins as a linear chain of twenty chemical building blocks called amino acids, which spontaneously folds within milliseconds into an intricate three-dimensional shape that determines its biological function. For fifty years, structural biologists struggled to predict that final 3D architecture from a genetic sequence alone, as finding just one structure experimentally via X-ray crystallography often consumed years of painstaking laboratory work.",
        gistVi: "Suốt 50 năm, việc dự đoán cấu trúc không gian 3D của protein từ chuỗi axit amin là bài toán hóc búa, tốn nhiều năm thí nghiệm cho mỗi phân tử."
      },
      {
        id: "B",
        text: "That long-standing bottleneck was broken by computational breakthroughs honored with the Nobel Prize in Chemistry for Demis Hassabis, John Jumper, and David Baker. By training a deep-learning neural network called AlphaFold on evolutionary patterns across hundreds of thousands of known proteins, Hassabis and Jumper predicted atomic-level structures nearly as accurately as physical crystallography. Within a single year, artificial intelligence mapped almost all two hundred million proteins cataloged across Earth's species, turning years of bench work into an instant digital lookup.",
        gistVi: "Hệ thống AI AlphaFold của Hassabis và Jumper đã giải quyết bài toán này ở độ chính xác nguyên tử cho gần 200 triệu protein, mang về giải Nobel Hóa học."
      },
      {
        id: "C",
        text: "While AlphaFold learned to read nature's existing blueprints, David Baker's research group tackled the inverse challenge: de novo protein design, or inventing brand-new proteins never produced by evolution. Natural evolution has tested only a minuscule fraction of all possible amino-acid combinations, guided strictly by ancestral survival needs. Using generative algorithms alongside physics-based modeling software, scientists can now specify a target geometric shape—such as binding tightly to lethal snake venom or breaking down synthetic microplastics—and generate a fresh amino-acid sequence tailored to fold into that exact molecular tool.",
        gistVi: "Song song đó, nhóm của David Baker mở đường cho thiết kế protein 'de novo' — tạo ra các phân tử hoàn toàn mới chưa từng có trong tự nhiên để trung hòa độc tố hoặc phân hủy vi nhựa."
      },
      {
        id: "D",
        text: "Subsequent iterations, including AlphaFold 3, expanded predictions beyond single proteins to model dynamic interactions among DNA, RNA, metal ions, and candidate pharmaceuticals. Oncology and virology researchers now screen thousands of drug molecules virtually before mixing chemicals in a test tube. Experimental validation remains essential, however, because living cells are crowded, fluctuating environments where proteins flex across several shapes rather than sitting still like statues.",
        gistVi: "Thế hệ mô hình mới mở rộng sang dự đoán tương tác giữa protein với DNA, RNA và thuốc, giúp sàng lọc thuốc nhanh chóng dù vẫn cần kiểm chứng thực nghiệm trong tế bào sống."
      },
      {
        id: "E",
        text: "Making molecular design accessible has simultaneously sparked urgent biosecurity debates. Because the same generative software that designs benign enzymes for carbon capture or flu vaccines could theoretically be misused to engineer harmful toxins, leading biology consortia embedded security checks into commercial DNA synthesis platforms. Before gene-printing facilities ship physical genetic material, automated screening software verifies customer credentials and checks synthetic sequences against hazardous patterns.",
        gistVi: "Sự phổ cập thiết kế phân tử cũng đặt ra thách thức an ninh sinh học, buộc các cơ sở tổng hợp DNA phải tích hợp cơ chế sàng lọc độc tố và xác thực danh tính."
      }
    ],
    questions: [
      {
        id: "q1",
        type: "tfng",
        prompt: "Before AI breakthroughs, determining a single protein's 3D shape in the laboratory could take several years of experimental work.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 0,
        para: "A",
        explainVi: "Đoạn A viết rõ: 'Determining just a single protein structure experimentally... often consumed years of painstaking laboratory labor' → TRUE."
      },
      {
        id: "q2",
        type: "tfng",
        prompt: "Natural evolution has already tested nearly half of all mathematically possible amino-acid sequences.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 1,
        para: "C",
        explainVi: "Đoạn C khẳng định ngược lại: tiến hóa tự nhiên chỉ mới thử nghiệm một phần cực nhỏ ('samples only a minuscule fraction of all possible amino-acid combinations') → FALSE."
      },
      {
        id: "q3",
        type: "mcq",
        prompt: "Why does laboratory validation remain necessary despite advanced biomolecular AI models?",
        options: [
          "A. Neural networks cannot read sequences longer than fifty amino acids",
          "B. Proteins inside living cells shift dynamically across shapes in crowded environments",
          "C. X-ray crystallography is now cheaper than running computer simulations",
          "D. Most diseases are caused by carbohydrates rather than proteins"
        ],
        answer: 1,
        para: "D",
        explainVi: "Đoạn D nêu lý do: môi trường tế bào sống đông đúc và biến động khiến protein uốn dẻo qua nhiều trạng thái ('flex between multiple conformations') thay vì đứng yên → Đáp án B."
      },
      {
        id: "q4",
        type: "mcq",
        prompt: "What biosecurity measure is described in Paragraph E?",
        options: [
          "A. Banning universities from publishing structural biology papers",
          "B. Restricting AlphaFold exclusively to military research institutes",
          "C. Screening synthetic gene orders at DNA synthesis facilities for dangerous functional patterns",
          "D. Replacing chemical enzymes with mechanical nanobots"
        ],
        answer: 2,
        para: "E",
        explainVi: "Đoạn E mô tả việc tích hợp lớp bảo vệ vào nền tảng đặt hàng tổng hợp DNA để kiểm tra danh tính và quét các cấu trúc nguy hiểm trước khi in mã gen vật lý → Đáp án C."
      }
    ]
  },
  {
    id: "eco-11",
    num: 14,
    category: "economics",
    tag: "Kinh tế học Thể chế · Giải Nobel",
    sourceNote: "Nobel Prize in Economic Sciences · Acemoglu, Johnson & Robinson",
    passage: 3,
    band: "Passage 3 · 7.5–8.5",
    metrics: { score: 100.2, avgSent: 28.6, c1c2Pct: 15.2, b2PlusPct: 30.8, fkGrade: 20.4 },
    topicId: 11,
    title: "Rules of Prosperity: Why Inclusive Institutions Outperform Geography",
    titleVi: "Quy tắc thịnh vượng: Vì sao thể chế dung hợp quyết định giàu nghèo hơn cả địa lý",
    paragraphs: [
      {
        id: "A",
        text: "Today, the richest twenty percent of nations generate roughly thirty times more average income per citizen than the poorest twenty percent—a gap that has persisted for over a century. Economists and historians long debated whether such disparities stem mainly from unchangeable geography, such as tropical disease burdens and landlocked terrain, or from cultural attitudes toward saving and work. Daron Acemoglu, Simon Johnson, and James Robinson decisively reshaped that debate and earned the Nobel Prize in Economic Sciences by demonstrating empirically that human-made political and economic institutions are the primary driver of long-run national prosperity.",
        gistVi: "Giải Nobel Kinh tế của Acemoglu, Johnson và Robinson chứng minh chính thể chế kinh tế – chính trị do con người thiết lập mới là yếu tố cốt lõi quyết định sự giàu nghèo lâu dài của quốc gia."
      },
      {
        id: "B",
        text: "Because researchers cannot run laboratory experiments on whole nations, the laureates examined 'natural experiments' left behind by five centuries of colonial history. Remarkably, territories that were among the wealthiest and most densely urbanized civilizations in 1500 often became relatively poorer in the modern era, whereas formerly sparsely populated regions grew affluent—a dramatic 'reversal of fortune' incompatible with simple geographic determinism. Where European colonizers encountered severe malaria mortality or dense local populations to tax, they established 'extractive institutions' designed solely to funnel minerals and crops toward a narrow ruling elite.",
        gistVi: "Hiện tượng 'đảo chiều vận mệnh' bác bỏ thuyết địa lý đơn thuần: những nơi thiết lập 'thể chế tước đoạt' chỉ nhằm vơ vét tài nguyên cho nhóm thiểu số đã rơi vào trì trệ kéo dài."
      },
      {
        id: "C",
        text: "Conversely, in colonies where settlers resided permanently in large numbers and demanded legal representation, authorities were forced to construct 'inclusive institutions': secure property rights, impartial courts, open market entry, and public infrastructure accessible to broad society. Inclusive rules unleash sustained growth because ordinary farmers, engineers, and entrepreneurs know that arbitrary confiscation or powerful monopolies will not strip away the rewards of their investment.",
        gistVi: "Ngược lại, 'thể chế dung hợp' — bảo vệ quyền tài sản, tòa án công bằng và cạnh tranh mở — khuyến khích người dân đầu tư và sáng tạo vì thành quả được bảo đảm."
      },
      {
        id: "D",
        text: "Critics often raise an important puzzle: can authoritarian or extractive regimes not achieve rapid industrial growth as well? Historical command economies show that ruling elites can indeed mobilize forced savings and move rural workers into state steel mills for a few decades. Yet the laureates' models explain why extractive growth eventually stalls: sustained prosperity depends on frontier innovation, which threatens the economic rents and political power of ruling incumbents, prompting them to block independent challengers.",
        gistVi: "Các nền kinh tế tước đoạt vẫn có thể tăng trưởng nhanh vài thập kỷ đầu, nhưng sớm chững lại vì nhóm nắm quyền cũ luôn cản trở những đổi mới đe dọa lợi ích của họ."
      },
      {
        id: "E",
        text: "Recently, Acemoglu and Johnson applied this institutional framework directly to artificial intelligence and digital markets. Technology itself, they argue, does not automatically raise median worker wages; during the early British Industrial Revolution, factory living standards stagnated for decades until trade unions, universal schooling, and democratic reforms steered inventions toward worker-complementing tools rather than pure labor replacement. Ensuring that modern automation fosters shared prosperity will similarly depend on institutional choices governing competition, education, and bargaining power.",
        gistVi: "Áp dụng vào kỷ nguyên AI, các tác giả nhấn mạnh công nghệ không tự động tăng lương cho số đông nếu thiếu cải cách giáo dục và thể chế định hướng công nghệ hỗ trợ người lao động."
      }
    ],
    questions: [
      {
        id: "q1",
        type: "tfng",
        prompt: "The 'reversal of fortune' over the past five hundred years strongly supports the theory that geography alone dictates national wealth.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 1,
        para: "B",
        explainVi: "Đoạn B khẳng định hiện tượng 'đảo chiều vận mệnh' hoàn toàn mâu thuẫn với thuyết quyết định luận địa lý đơn thuần ('incompatible with simple geographic determinism') → FALSE."
      },
      {
        id: "q2",
        type: "tfng",
        prompt: "Extractive economies are completely incapable of achieving even short-term industrial growth.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 1,
        para: "D",
        explainVi: "Đoạn D giải thích các chế độ tước đoạt VẪN CÓ THỂ tạo ra tăng trưởng công nghiệp nhanh trong vài thập kỷ nhờ huy động tiết kiệm và dịch chuyển lao động, trước khi chạm trần dài hạn → FALSE."
      },
      {
        id: "q3",
        type: "mcq",
        prompt: "Why does growth under extractive institutions eventually stall according to Paragraph D?",
        options: [
          "A. Natural mineral deposits always run out within thirty years",
          "B. Ruling incumbents block frontier innovations that threaten their existing economic and political power",
          "C. Rural workers refuse to relocate to urban manufacturing centers",
          "D. International courts prohibit extractive states from exporting steel"
        ],
        answer: 1,
        para: "D",
        explainVi: "Đoạn D chỉ rõ tăng trưởng dài hạn cần đổi mới sáng tạo ở đường biên, điều làm lung lay đặc quyền của nhóm thống trị hiện hữu nên họ có xu hướng kìm hãm người mới → Đáp án B."
      },
      {
        id: "q4",
        type: "mcq",
        prompt: "What historical parallel from the British Industrial Revolution is drawn in Paragraph E?",
        options: [
          "A. Steam engines immediately doubled workers' real wages within five years",
          "B. Broad wage gains arrived only after institutional reforms steered technology to complement workers",
          "C. Digital monopolies existed in nineteenth-century textile towns",
          "D. Automation works best when competition laws are repealed"
        ],
        answer: 1,
        para: "E",
        explainVi: "Đoạn E nêu bài học Cách mạng Công nghiệp Anh: mức sống công nhân dậm chân tại chỗ nhiều thập kỷ cho đến khi giáo dục phổ cập và cải cách thể chế định hướng công nghệ bổ trợ người lao động → Đáp án B."
      }
    ]
  },
  {
    id: "eco-12",
    num: 15,
    category: "economics",
    tag: "Tăng trưởng & Sáng tạo · Giải Nobel 2025",
    sourceNote: "2025 Nobel Prize in Economic Sciences · Mokyr, Aghion & Howitt",
    passage: 3,
    band: "Passage 3 · 7.5–8.5",
    metrics: { score: 101.8, avgSent: 26.7, c1c2Pct: 18.0, b2PlusPct: 31.6, fkGrade: 19.2 },
    topicId: 11,
    title: "The Engine of Creative Destruction: Knowledge, Competition, and Growth",
    titleVi: "Cỗ máy phá hủy sáng tạo: Tri thức, cạnh tranh và động lực tăng trưởng kinh tế",
    paragraphs: [
      {
        id: "A",
        text: "For nearly all of recorded human history prior to 1800, global economic output per person resembled a flat line. Ingenious inventions occasionally appeared—waterwheels, windmills, movable type, mechanical clocks—yet living standards barely budged from one century to the next because sporadic breakthroughs quickly fizzled out. Over the past two hundred years, by contrast, sustained technological innovation has compounded steadily year after year, lifting billions out of subsistence poverty. Explaining why continuous growth suddenly ignited—and what keeps it alive—earned Joel Mokyr, Philippe Aghion, and Peter Howitt the 2025 Nobel Prize in Economic Sciences.",
        gistVi: "Suốt hàng thiên niên kỷ trước năm 1800, mức sống nhân loại gần như đi ngang; giải Nobel Kinh tế 2025 của Mokyr, Aghion và Howitt giải thích vì sao tăng trưởng dựa trên đổi mới liên tục bùng nổ suốt hai thế kỷ qua."
      },
      {
        id: "B",
        text: "Economic historian Joel Mokyr solved the historical half of this puzzle by distinguishing between two forms of human knowledge: 'propositional knowledge'—scientific understanding of why natural phenomena occur—and 'prescriptive knowledge'—practical recipes for how to make things work. Ancient artisans often mastered impressive techniques without grasping the underlying physics or chemistry, making further refinement hit a dead end. During the European Enlightenment, however, a vibrant cross-border 'Republic of Letters,' scientific societies, and skilled instrument makers created a feedback loop linking laboratory theory directly to workshop engineering, turning isolated inventions into self-sustaining cascades.",
        gistVi: "Joel Mokyr chỉ ra bước ngoặt nằm ở vòng lặp kết nối chặt chẽ giữa 'tri thức khoa học giải thích bản chất' và 'kỹ thuật chế tạo thực tiễn' kể từ thời Khai sáng."
      },
      {
        id: "C",
        text: "While Mokyr uncovered the cultural soil of progress, macroeconomists Philippe Aghion and Peter Howitt constructed the mathematical engine explaining how modern markets sustain innovation: formalizing Joseph Schumpeter's famous concept of 'creative destruction.' Beneath calm macroeconomic headline figures—such as a steady two or three percent annual GDP growth rate—lies turbulent microeconomic churn. Every year, roughly ten percent of firms and jobs vanish as entrepreneurial challengers introduce superior products or cleaner production methods that render yesterday's leading technologies commercially obsolete.",
        gistVi: "Aghion và Howitt mô hình hóa toán học khái niệm 'phá hủy sáng tạo': đằng sau mức tăng GDP ổn định là sự thanh lọc sôi động khi công nghệ mới liên tục đào thải sản phẩm cũ."
      },
      {
        id: "D",
        text: "Aghion and Howitt's endogenous growth models revealed subtle policy trade-offs that challenge simplistic ideological slogans. Innovators require temporary patent protection and profit margins to justify risky research expenditures; if imitation is instantaneous, nobody invests in discovery. Yet once an innovative startup matures into a dominant corporate giant, its incentives flip: rather than risking self-cannibalization, entrenched conglomerates frequently deploy lobbying clout, patent thickets, and killer acquisitions of young rivals to choke off the next wave of creative destruction.",
        gistVi: "Mô hình chỉ ra nghịch lý: doanh nghiệp cần bảo hộ bằng sáng chế tạm thời để có động lực R&D, nhưng khi đã thành tập đoàn độc quyền họ lại dùng thâu tóm và vận động hành lang để bóp nghẹt đối thủ trẻ."
      },
      {
        id: "E",
        text: "Consequently, sustaining innovation-driven prosperity requires what Nordic welfare-market hybrids famously term 'flexicurity' paired with vigorous antitrust enforcement. Rather than subsidizing dying legacy industries to freeze existing jobs in amber, effective governments protect individual workers—through generous retraining stipends, portable health benefits, and income insurance—while allowing unproductive firms to exit freely and keeping market entry wide open for challengers. Whether confronting artificial intelligence or green industrial transformation, societies thrive only when creative destruction remains contestable rather than captured.",
        gistVi: "Bài học chính sách cốt lõi là bảo vệ 'người lao động' (bằng đào tạo lại và an sinh linh hoạt) chứ không cứu vớt 'doanh nghiệp lạc hậu', đồng thời thực thi chống độc quyền nghiêm ngặt."
      }
    ],
    questions: [
      {
        id: "q1",
        type: "tfng",
        prompt: "Before 1800, important inventions never occurred anywhere in the world.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 1,
        para: "A",
        explainVi: "Đoạn A nêu rõ các phát minh tài tình VẪN xuất hiện (bánh xe nước, cối xay gió, chữ in rời, đồng hồ cơ), chỉ là chúng rời rạc và không duy trì thành đà tăng trưởng liên tục → FALSE."
      },
      {
        id: "q2",
        type: "tfng",
        prompt: "According to Joel Mokyr, pre-industrial craftspeople often knew how to apply practical techniques without understanding the underlying scientific laws.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 0,
        para: "B",
        explainVi: "Đoạn B viết các nghệ nhân cổ đại thường thành thạo kỹ thuật thực hành nhưng không nắm được nguyên lý vật lý/hóa học nền tảng ('without grasping the underlying physics or chemistry') → TRUE."
      },
      {
        id: "q3",
        type: "mcq",
        prompt: "What dilemma regarding market incentives do Aghion and Howitt highlight in Paragraph D?",
        options: [
          "A. Eliminating all intellectual property laws doubles private research spending",
          "B. Successful innovators need temporary profit incentives, yet dominant incumbents often use their power to block newer rivals",
          "C. Small startups spend more money on political lobbying than multinational corporations",
          "D. Macroeconomic GDP statistics always exaggerate corporate bankruptcies"
        ],
        answer: 1,
        para: "D",
        explainVi: "Đoạn D phân tích thế lưỡng nan: nhà sáng tạo cần lợi nhuận/bằng sáng chế tạm thời để bù đắp rủi ro R&D, nhưng khi đã thống lĩnh thị trường, họ lại dễ dùng thâu tóm và rào cản để chặn thế hệ đổi mới tiếp theo → Đáp án B."
      },
      {
        id: "q4",
        type: "mcq",
        prompt: "What policy approach does Paragraph E recommend to manage creative destruction humanely?",
        options: [
          "A. Permanently bailing out declining companies so no firm ever closes",
          "B. Supporting displaced workers with retraining and safety nets while keeping markets open to new entrants",
          "C. Banning foreign scientific journals to protect domestic workshops",
          "D. Restricting research grants exclusively to the three largest firms in each sector"
        ],
        answer: 1,
        para: "E",
        explainVi: "Đoạn E khuyến nghị mô hình bảo vệ người lao động (trợ cấp đào tạo lại, bảo hiểm thu nhập) song hành với luật chống độc quyền mở cửa cho doanh nghiệp mới thay vì bao cấp doanh nghiệp yếu kém → Đáp án B."
      }
    ]
  },
  {
    id: "eco-14",
    num: 16,
    category: "economics",
    tag: "Thương mại Quốc tế & Kinh tế Khí hậu",
    sourceNote: "NBER & World Bank Empirical Studies · Carbon Border Adjustment Mechanisms (CBAM)",
    passage: 3,
    band: "Passage 3 · 7.5–8.5",
    metrics: { score: 111.7, avgSent: 35.3, c1c2Pct: 13.9, b2PlusPct: 32.5, fkGrade: 22.3 },
    topicId: 11,
    title: "Pricing Carbon at the Border: Trade Friction and Green Comparative Advantage",
    titleVi: "Định giá Carbon tại biên giới: Ma sát thương mại và lợi thế so sánh xanh",
    paragraphs: [
      {
        id: "A",
        text: "For three decades, international climate diplomacy stumbled over a classic collective-action problem known as 'carbon leakage.' When one jurisdiction—such as the European Union—forces domestic steelmakers, cement producers, and chemical plants to buy expensive emissions permits, energy-intensive factories face a strong temptation to relocate production to countries with lax environmental rules, exporting finished goods back home while global greenhouse emissions remain unchanged or even rise. To plug that loophole, the European Union transitioned its Carbon Border Adjustment Mechanism, or CBAM, from a reporting trial into definitive tariff enforcement in 2026, inspiring parallel blueprints in Britain and several advanced economies.",
        gistVi: "Để ngăn chặn 'rò rỉ carbon' (nhà máy dời sang nước tiêu chuẩn thấp rồi xuất khẩu ngược lại), Liên minh Châu Âu đã chính thức thực thi Cơ chế Điều chỉnh Biên giới Carbon (CBAM) từ năm 2026."
      },
      {
        id: "B",
        text: "In theory, a carbon border levy restores fair competition: importers of foreign iron, aluminum, fertilizer, electricity, and hydrogen must purchase certificates mirroring the domestic carbon price, minus any verified carbon tax already paid in the country of origin. Crucially, empirical trade studies published by the National Bureau of Economic Research uncovered a surprising pattern across global manufacturing: carbon emissions intensity varies enormously even among countries at similar income levels, meaning 'comparative advantage in monetary production costs' and 'green comparative advantage in low-carbon metallurgy' do not always align.",
        gistVi: "Nghiên cứu thực nghiệm của NBER phát hiện cường độ phát thải carbon chênh lệch rất lớn ngay giữa các nước cùng mức thu nhập, hình thành khái niệm mới là 'lợi thế so sánh xanh'."
      },
      {
        id: "C",
        text: "For example, aluminum smelters powered by abundant hydroelectric dams in Norway, Canada, or Mozambique emit a fraction of the carbon dioxide per ton released by coal-powered smelters elsewhere, granting clean-grid exporters a sudden competitive windfall in European markets. Conversely, export-reliant developing economies whose industrial grids still depend heavily on legacy coal plants—alongside small businesses burdened by complex supply-chain carbon accounting paperwork—have criticized unilateral border tariffs at the World Trade Organization as 'green protectionism' that penalizes nations historically least responsible for cumulative atmospheric warming.",
        gistVi: "Các nhà xuất khẩu dùng thủy điện sạch hưởng lợi lớn, trong khi nhiều nước đang phát triển phụ thuộc điện than và thiếu năng lực kiểm kê carbon chỉ trích đây là 'chủ nghĩa bảo hộ xanh'."
      },
      {
        id: "D",
        text: "Economic modeling also warns of subtle 'resource shuffling' that can blunt CBAM's environmental impact unless carefully designed. Multinational conglomerates operating ten steel mills—two powered by renewable electricity and eight by coal—can legally dedicate output from their two cleanest factories exclusively to European buyers to avoid border fees, while routing high-carbon steel from the remaining eight mills to domestic or unregulated markets. On paper, Europe's imported footprint plummets; in Earth's shared atmosphere, total smokestack emissions barely budge.",
        gistVi: "Mô hình kinh tế còn cảnh báo mánh khóe 'xáo trộn nguồn hàng': tập đoàn đa quốc gia dồn hàng từ vài nhà máy sạch xuất sang châu Âu né thuế, còn thép phát thải cao vẫn bán sang thị trường khác khiến tổng khí thải toàn cầu không giảm."
      },
      {
        id: "E",
        text: "Despite these frictions, trade economists observe a powerful 'Brussels ripple effect' unfolding across emerging industrial hubs from Turkey and India to Brazil and Vietnam. Rather than forfeiting tariff revenues to foreign customs authorities in Europe, exporting governments have a direct fiscal incentive to establish their own domestic carbon pricing systems—keeping carbon tax revenues at home to fund local grid upgrades while automatically exempting their exporters from foreign CBAM surcharges. If paired with green-finance transfers to help developing nations decarbonize heavy industry, border carbon pricing could evolve from a unilateral trade shield into a stepping-stone toward coordinated global climate clubs.",
        gistVi: "Dù vậy, CBAM đang thúc đẩy nhiều nền kinh tế xuất khẩu (Ấn Độ, Brazil, Việt Nam...) tự xây dựng thị trường định giá carbon nội địa để giữ lại nguồn thu thuế đầu tư nâng cấp lưới điện trong nước."
      }
    ],
    questions: [
      {
        id: "q1",
        type: "tfng",
        prompt: "Under the EU's CBAM rules, importers can deduct verified carbon taxes that were already paid in the exporting country.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 0,
        para: "B",
        explainVi: "Đoạn B ghi rõ nhà nhập khẩu mua chứng chỉ tương đương giá carbon nội địa, trừ đi khoản thuế carbon đã nộp có xác nhận tại nước xuất xứ ('minus any verified carbon tax already paid in the country of origin') → TRUE."
      },
      {
        id: "q2",
        type: "tfng",
        prompt: "NBER studies found that countries with identical per-capita incomes always emit identical amounts of carbon per ton of steel.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 1,
        para: "B",
        explainVi: "Đoạn B khẳng định ngược lại: cường độ phát thải carbon khác biệt khổng lồ ngay cả giữa những quốc gia có mức thu nhập tương đương ('varies enormously even among countries at similar income levels') → FALSE."
      },
      {
        id: "q3",
        type: "mcq",
        prompt: "What is 'resource shuffling' as described in Paragraph D?",
        options: [
          "A. Smuggling untaxed aluminum across maritime borders at night",
          "B. Sending goods from a firm's cleanest plants to regulated markets while selling dirtier output elsewhere, leaving global emissions unchanged",
          "C. Replacing iron ore with recycled timber in European construction",
          "D. Transferring European carbon tax revenues directly to hydroelectric dam operators"
        ],
        answer: 1,
        para: "D",
        explainVi: "Đoạn D giải thích 'resource shuffling' là việc tập đoàn dành riêng sản lượng từ 2 nhà máy sạch xuất sang châu Âu để né phí, còn hàng từ 8 nhà máy chạy than bán cho thị trường khác, khiến tổng phát thải khí quyển hầu như không đổi → Đáp án B."
      },
      {
        id: "q4",
        type: "mcq",
        prompt: "Why are several exporting countries introducing their own domestic carbon pricing systems according to Paragraph E?",
        options: [
          "A. To qualify for free electricity imports from Norway",
          "B. To retain carbon tax revenues domestically rather than letting foreign customs collect border levies",
          "C. Because the World Trade Organization outlawed all steel exports without domestic taxes",
          "D. To encourage factories to switch back from solar power to coal"
        ],
        answer: 1,
        para: "E",
        explainVi: "Đoạn E chỉ ra động lực tài khóa trực tiếp: thay vì để hải quan châu Âu thu khoản phí carbon đó, chính phủ nước xuất khẩu tự thu thuế carbon nội địa để giữ ngân sách đầu tư lưới điện trong nước và giúp doanh nghiệp được khấu trừ phí CBAM → Đáp án B."
      }
    ]
  },
  {
    id: "sci-05",
    num: 17,
    category: "science",
    tag: "Vật lý lượng tử · Giải Nobel 2025",
    sourceNote: "2025 Nobel Prize in Physics & Harvard/QuEra Error-Corrected Quantum Arrays",
    passage: 3,
    band: "Passage 3 · 7.5–8.5",
    metrics: { score: 114.7, avgSent: 27.1, c1c2Pct: 21.5, b2PlusPct: 37.0, fkGrade: 19.5 },
    topicId: 1,
    title: "From Macroscopic Quantum Tunneling to Fault-Tolerant Qubits",
    titleVi: "Từ hiệu ứng xuyên hầm lượng tử vĩ mô đến máy tính lượng tử tự sửa lỗi",
    paragraphs: [
      {
        id: "A",
        text: "In everyday classical physics, a rubber ball rolled gently up a steep hill without sufficient kinetic energy will inevitably roll back down; it can never materialize on the far side of the barrier. At the subatomic scale of electrons and alpha particles, however, quantum mechanics permits a ghostly phenomenon called tunneling, whereby a particle's wave-like probability cloud leaks directly through an energy barrier. For decades, physicists debated whether such bizarre quantum behavior vanished entirely in macroscopic objects composed of billions of atoms, or whether carefully engineered electrical circuits could exhibit collective quantum states visible to laboratory instruments.",
        gistVi: "Trong thế giới hạ nguyên tử, hạt có thể 'xuyên hầm' qua rào cản năng lượng; giới vật lý từng tranh cãi liệu hiện tượng lượng tử này có thể xuất hiện ở các mạch điện quy mô vĩ mô hay không."
      },
      {
        id: "B",
        text: "That foundational question was answered through pioneering superconducting experiments by John Clarke, Michel H. Devoret, and John M. Martinis, laureates of the 2025 Nobel Prize in Physics. Cooling aluminum and niobium electrical loops near absolute zero so electrical resistance dropped to zero, they constructed Josephson junctions—two superconductors separated by an insulating oxide layer only nanometers thick. Billions of paired electrons flowed in unison as a single macroscopic quantum wave, demonstrating both discrete energy quantization and macroscopic quantum mechanical tunneling across an engineered circuit chip.",
        gistVi: "Giải Nobel Vật lý 2025 tôn vinh Clarke, Devoret và Martinis vì chứng minh tỷ hạt electron trong mạch siêu dẫn làm lạnh cực sâu có thể hoạt động như một sóng lượng tử vĩ mô thống nhất."
      },
      {
        id: "C",
        text: "Those very superconducting circuits became the architectural blueprint for modern transmon quantum bits, or qubits, powering leading quantum processors today. Unlike classical silicon transistors restricted to binary zeros or ones, superconducting and neutral-atom qubits exploit superposition and entanglement to explore vast computational spaces simultaneously. Yet scaling quantum hardware has long been thwarted by 'decoherence': the slightest stray thermal vibration, electromagnetic fluctuation, or cosmic ray collapses fragile quantum states within microseconds, introducing bit-flip and phase-flip errors far faster than complex algorithms can finish running.",
        gistVi: "Mạch siêu dẫn trở thành nền tảng cho qubit hiện đại, nhưng rào cản lớn nhất là 'mất kết hợp lượng tử' (decoherence) khi nhiễu môi trường phá vỡ trạng thái qubit chỉ trong vài micro-giây."
      },
      {
        id: "D",
        text: "Between 2025 and 2026, experimental physics labs crossed a historic threshold toward fault-tolerant quantum computing. Rather than relying on single error-prone physical qubits, researchers wove dozens of physical superconducting qubits—or laser-trapped rubidium atoms—into 'logical qubits' protected by topological surface codes. Crucially, experiments demonstrated the 'below-threshold' milestone: adding more physical qubits to a logical cluster actually suppressed error rates exponentially instead of introducing more noise, while real-time syndrome decoders detected and corrected quantum errors mid-calculation without directly measuring and destroying the underlying quantum information.",
        gistVi: "Giai đoạn 2025–2026 đánh dấu cột mốc 'qubit logic tự sửa lỗi': gom nhiều qubit vật lý để giảm lỗi theo cấp số nhân và sửa lỗi thời gian thực mà không làm sập thông tin lượng tử."
      },
      {
        id: "E",
        text: "Achieving fault tolerance does not mean quantum computers will replace everyday laptops for streaming video or running spreadsheets, tasks at which classical chips remain vastly faster and cheaper. Instead, error-corrected logical qubits are poised to tackle specialized problems governed by quantum mechanics itself: simulating nitrogen-fixation catalysts to manufacture green fertilizer without burning natural gas, modeling solid-state battery electrolytes at atomic precision, and stress-testing post-quantum cryptographic standards that safeguard global banking infrastructure.",
        gistVi: "Máy tính lượng tử tự sửa lỗi không thay thế laptop thông thường mà giải quyết các bài toán chuyên sâu như mô phỏng chất xúc tác phân bón xanh, pin thể rắn và mật mã bảo mật ngân hàng."
      }
    ],
    questions: [
      {
        id: "q1",
        type: "tfng",
        prompt: "In Josephson junction experiments, circuits were cooled close to absolute zero to eliminate electrical resistance.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 0,
        para: "B",
        explainVi: "Đoạn B mô tả rõ việc làm lạnh các vòng mạch nhôm/niobi xuống gần độ không tuyệt đối để điện trở giảm về không ('Cooling... near absolute zero so electrical resistance dropped to zero') → TRUE."
      },
      {
        id: "q2",
        type: "tfng",
        prompt: "Fault-tolerant quantum processors are expected to make conventional silicon laptops obsolete for everyday tasks like spreadsheets.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 1,
        para: "E",
        explainVi: "Đoạn E khẳng định rõ máy tính lượng tử sẽ KHÔNG thay thế laptop hằng ngày cho xem video hay bảng tính vì chip cổ điển vẫn nhanh và rẻ hơn nhiều ở các tác vụ đó → FALSE."
      },
      {
        id: "q3",
        type: "mcq",
        prompt: "What is 'decoherence' as explained in Paragraph C?",
        options: [
          "A. The cooling of aluminum wires using liquid helium",
          "B. The loss of fragile quantum states caused by tiny environmental disturbances",
          "C. The encryption of financial transactions across fiber-optic cables",
          "D. The pairing of two electrons inside an insulating barrier"
        ],
        answer: 1,
        para: "C",
        explainVi: "Đoạn C định nghĩa decoherence là hiện tượng rung động nhiệt nhỏ nhất hay nhiễu điện từ làm sụp đổ trạng thái lượng tử mong manh chỉ trong micro-giây → Đáp án B."
      },
      {
        id: "q4",
        type: "mcq",
        prompt: "Why was crossing the 'below-threshold' milestone in Paragraph D so significant?",
        options: [
          "A. It allowed quantum chips to operate comfortably at room temperature",
          "B. Scaling up the number of physical qubits in a logical unit reduced overall errors rather than multiplying them",
          "C. It eliminated the need for error-correction decoding algorithms",
          "D. It reduced the physical size of a quantum computer to fit inside a wristwatch"
        ],
        answer: 1,
        para: "D",
        explainVi: "Đoạn D nhấn mạnh cột mốc 'below-threshold': việc tăng thêm qubit vật lý vào cụm qubit logic thực sự giúp triệt tiêu tỷ lệ lỗi theo cấp số nhân thay vì gây thêm nhiễu → Đáp án B."
      }
    ]
  },
  {
    id: "sci-04",
    num: 18,
    category: "science",
    tag: "Miễn dịch học · Giải Nobel 2025",
    sourceNote: "2025 Nobel Prize in Physiology or Medicine · Peripheral Immune Tolerance",
    passage: 3,
    band: "Passage 3 · 7.5–8.5",
    metrics: { score: 124.6, avgSent: 26.8, c1c2Pct: 24.8, b2PlusPct: 43.5, fkGrade: 18.6 },
    topicId: 6,
    title: "Peacekeepers Within: Regulatory T Cells and the Secret of Immune Tolerance",
    titleVi: "Lực lượng gìn giữ hòa bình nội tại: Tế bào T điều hòa và bí mật dung nạp miễn dịch",
    paragraphs: [
      {
        id: "A",
        text: "The human immune system operates on a razor's edge. Every day, billions of white blood cells patrol tissues to identify and annihilate mutating cancer cells, viruses, fungi, and bacteria. Because pathogens evolve rapidly, immune receptors are generated through random genetic shuffling, an ingenious process that inevitably produces millions of rogue lymphocytes capable of attacking the body's own healthy organs. Immunologists long understood that many self-reactive T cells are weeded out early inside the thymus gland—a process termed central tolerance—yet plenty of potentially destructive cells still slip into the bloodstream without triggering autoimmune chaos in healthy individuals.",
        gistVi: "Hệ miễn dịch phải tiêu diệt mầm bệnh nhưng tránh tấn công nhầm cơ thể; dù tuyến ức đã lọc bớt tế bào tự phản ứng, nhiều tế bào nguy hiểm vẫn lọt ra máu mà không gây bệnh ở người khỏe mạnh."
      },
      {
        id: "B",
        text: "Solving that biological paradox earned Shimon Sakaguchi, Mary E. Brunkow, and Fred Ramsdell the 2025 Nobel Prize in Physiology or Medicine for uncovering the mechanics of peripheral immune tolerance. Working against prevailing skepticism in the mid-1990s, Sakaguchi demonstrated that a distinct subpopulation of lymphocytes bearing a surface marker called CD25 acted not as warriors, but as dedicated peacekeepers. When these specialized 'regulatory T cells' were experimentally depleted in mice, the animals swiftly developed devastating inflammation across their thyroid, stomach, and endocrine glands; restoring those cells halted the self-inflicted assault.",
        gistVi: "Giải Nobel Y sinh 2025 vinh danh Sakaguchi, Brunkow và Ramsdell vì khám phá 'tế bào T điều hòa' — lực lượng gìn giữ hòa bình ngăn hệ miễn dịch tự hủy hoại nội tạng."
      },
      {
        id: "C",
        text: "The genetic master key governing these cellular peacekeepers emerged from parallel detective work by Brunkow and Ramsdell, who investigated a lethal inherited syndrome in mice characterized by scaly skin and runaway immune activation. Painstakingly narrowing down a vast chromosomal region before modern high-speed sequencing existed, they pinpointed a mutation in a previously unknown gene they named Foxp3, and swiftly proved that mutations in its human counterpart caused IPEX, a rare, life-threatening childhood autoimmune disorder. Sakaguchi's team subsequently linked the two discoveries, proving that Foxp3 is the indispensable transcription factor that programs naive T cells to become regulatory T cells.",
        gistVi: "Brunkow và Ramsdell tìm ra gen chủ chốt Foxp3 quyết định sự hình thành của tế bào T điều hòa; đột biến gen này gây hội chứng tự miễn nguy hiểm ở trẻ em."
      },
      {
        id: "D",
        text: "Today, peripheral tolerance is recognized as an active, lifelong balancing act across every barrier tissue, from the intestinal lining—where regulatory T cells prevent hyper-reactive inflammation against beneficial gut microbes and dietary proteins—to the maternal placenta during pregnancy. Intriguingly, malignant tumors often hijack this exact peacekeeping machinery to survive. Many solid cancers secrete chemical signals that recruit dense clouds of regulatory T cells into the tumor microenvironment, creating an immunosuppressive shield that puts killer T cells to sleep before they can destroy malignant tissue.",
        gistVi: "Dung nạp ngoại vi giúp cơ thể chung sống với lợi khuẩn đường ruột và bảo vệ thai nhi, nhưng các khối u ác tính lại lợi dụng chính tế bào T điều hòa làm lá chắn né tránh miễn dịch."
      },
      {
        id: "E",
        text: "This dual nature has spawned two opposite, rapidly advancing clinical strategies. For patients suffering from type 1 diabetes, lupus, multiple sclerosis, or organ transplant rejection, bioengineers are harvesting a patient's own lymphocytes, expanding engineered regulatory T cells outside the body, and infusing them back to calm localized tissue destruction without broadly disabling infection defense. Conversely, in oncology, next-generation immunotherapies aim to selectively strip away intratumoral regulatory T cells, tearing down cancer's borrowed shield while leaving systemic immune harmony intact.",
        gistVi: "Khám phá này mở ra hai hướng điều trị đối lập: nhân bản tế bào T điều hòa để chữa bệnh tự miễn/chống thải ghép, hoặc vô hiệu hóa chúng quanh khối u để tiêu diệt ung thư."
      }
    ],
    questions: [
      {
        id: "q1",
        type: "tfng",
        prompt: "Central tolerance inside the thymus gland eliminates 100 percent of all self-reactive T cells before they enter circulation.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 1,
        para: "A",
        explainVi: "Đoạn A nói rõ dù tuyến ức đã lọc nhiều tế bào tự phản ứng, vẫn có rất nhiều tế bào nguy hiểm lọt vào máu ('yet plenty of potentially destructive cells still slip into the bloodstream') → FALSE."
      },
      {
        id: "q2",
        type: "tfng",
        prompt: "Mutations in the human equivalent of the Foxp3 gene are responsible for a severe childhood autoimmune condition called IPEX.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 0,
        para: "C",
        explainVi: "Đoạn C xác nhận đột biến trên gen tương ứng của Foxp3 ở người gây ra hội chứng tự miễn hiếm gặp đe dọa tính mạng trẻ em tên là IPEX → TRUE."
      },
      {
        id: "q3",
        type: "mcq",
        prompt: "How do cancerous tumors exploit regulatory T cells according to Paragraph D?",
        options: [
          "A. By converting regulatory T cells directly into rapidly dividing tumor cells",
          "B. By attracting them around the tumor to suppress attacking immune cells",
          "C. By destroying the Foxp3 gene inside the patient's bone marrow",
          "D. By blocking beneficial bacteria in the digestive tract"
        ],
        answer: 1,
        para: "D",
        explainVi: "Đoạn D giải thích khối u tiết tín hiệu hóa học thu hút tế bào T điều hòa vây quanh để tạo lá chắn ức chế các tế bào T sát thủ ('puts killer T cells to sleep') → Đáp án B."
      },
      {
        id: "q4",
        type: "mcq",
        prompt: "Why is engineered regulatory T-cell therapy promising for organ transplant recipients?",
        options: [
          "A. It eliminates the need to match blood types prior to surgery",
          "B. It calms targeted rejection of the new organ without shutting down overall defense against infections",
          "C. It permanently halts random receptor generation in white blood cells",
          "D. It replaces damaged organs using stem cells grown in mice"
        ],
        answer: 1,
        para: "E",
        explainVi: "Đoạn E chỉ ra liệu pháp truyền tế bào T điều hòa giúp làm dịu phản ứng tự miễn/thải ghép tại chỗ mà không làm tê liệt khả năng chống nhiễm trùng toàn cơ thể → Đáp án B."
      }
    ]
  },
  {
    id: "sci-03",
    num: 19,
    category: "science",
    tag: "Sinh học phân tử · Giải Nobel",
    sourceNote: "Nobel Prize in Physiology or Medicine · Discovery of microRNA",
    passage: 3,
    band: "Passage 3 · 7.5–8.5",
    metrics: { score: 125.1, avgSent: 28.6, c1c2Pct: 24.5, b2PlusPct: 38.7, fkGrade: 19.7 },
    topicId: 6,
    title: "Tiny Switches of Life: How MicroRNA Rewrote Gene Regulation",
    titleVi: "Những công tắc siêu nhỏ của sự sống: Cách microRNA viết lại quy luật điều hòa gen",
    paragraphs: [
      {
        id: "A",
        text: "Every somatic cell inside the human body—whether a contracting cardiac muscle fiber, a photoreceptor in the retina, or an insulin-secreting pancreatic cell—contains the exact same encyclopedia of deoxyribonucleic acid. What differentiates a neuron from a liver cell is not the possession of distinct genes, but selective gene regulation: ensuring that only the precise subset of instructions required for a cell's specialized identity is active at any given moment. For decades, molecular biologists assumed this regulatory choreography was controlled almost exclusively by specialized proteins called transcription factors, which bind to DNA to switch gene copying on or off.",
        gistVi: "Mọi tế bào trong cơ thể đều mang bộ DNA giống hệt nhau; sự khác biệt chức năng nằm ở cơ chế điều hòa gen mà giới khoa học từng nghĩ chỉ do protein đảm nhận."
      },
      {
        id: "B",
        text: "That textbook consensus was overturned by developmental geneticists Victor Ambros and Gary Ruvkun, whose persistence in studying a humble millimeter-long roundworm, Caenorhabditis elegans, earned the Nobel Prize in Physiology or Medicine. Investigating two mutant worm strains whose developmental timing went awry, Ambros discovered that a gene named lin-4 did not encode a protein at all. Instead, it produced an extraordinarily short, twenty-two-nucleotide strand of ribonucleic acid—a microRNA—that physically paired with complementary sequences on Ruvkun's target messenger RNA, lin-14, blocking protein synthesis without destroying the underlying genetic blueprint.",
        gistVi: "Nghiên cứu trên giun tròn của Victor Ambros và Gary Ruvkun phát hiện ra phân tử microRNA siêu ngắn có khả năng khóa quá trình dịch mã mRNA để điều tiết phát triển tế bào."
      },
      {
        id: "C",
        text: "When Ambros and Ruvkun published their initial findings in 1993, the broader scientific community greeted the mechanism with polite skepticism, dismissing it as an evolutionary peculiarity confined to nematodes. Seven years later, however, Ruvkun's laboratory identified a second microRNA, let-7, whose exact nucleotide sequence was conserved across mollusks, insects, fishes, and humans. Suddenly, biologists realized they had overlooked an ancient, universal layer of post-transcriptional governance operating across multicellular animals and plants for hundreds of millions of years.",
        gistVi: "Ban đầu bị coi là ngoại lệ chỉ có ở loài giun, nhưng việc tìm ra gen let-7 bảo tồn ở cả con người đã chứng minh microRNA là cơ chế điều hòa tiến hóa phổ quát."
      },
      {
        id: "D",
        text: "Subsequent genomic mapping revealed that the human genome encodes well over a thousand distinct microRNAs, collectively fine-tuning the output of more than half of all protein-coding genes. Rather than acting like binary light switches, microRNAs function more like precision dimmer dials that buffer cells against noisy environmental stress. A single microRNA species can simultaneously modulate dozens of related messenger RNAs within a metabolic network, while a single messenger RNA may harbor binding sites for multiple microRNAs, creating resilient combinatorial control.",
        gistVi: "Hệ gen người chứa hơn một nghìn loại microRNA đóng vai trò như 'núm vặn tinh chỉnh' điều tiết hơn một nửa số gen mã hóa protein."
      },
      {
        id: "E",
        text: "Understanding this hidden regulatory architecture has opened transformative frontiers in clinical diagnostics and therapeutics. When microRNA networks malfunction, cellular identity unravels, contributing to congenital hearing loss, skeletal disorders, autoimmune syndromes, and aggressive malignancies where tumor cells silence their own growth-suppressing microRNAs. Clinicians are now developing liquid biopsies that detect circulating microRNA signatures in routine blood draws to catch pancreatic and ovarian cancers early, alongside synthetic oligonucleotide drugs designed to mimic or inhibit specific microRNAs in diseased tissues.",
        gistVi: "Rối loạn microRNA dẫn đến ung thư và nhiều bệnh di truyền, mở đường cho xét nghiệm máu tầm soát ung thư sớm (sinh thiết lỏng) và thuốc RNA nhắm trúng đích."
      }
    ],
    questions: [
      {
        id: "q1",
        type: "tfng",
        prompt: "Heart muscle cells and retinal cells in the same person contain different sets of DNA sequences.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 1,
        para: "A",
        explainVi: "Đoạn A khẳng định mọi tế bào soma (tim, võng mạc, tụy...) đều chứa cùng một bộ DNA giống hệt nhau ('contains the exact same encyclopedia of deoxyribonucleic acid') → FALSE."
      },
      {
        id: "q2",
        type: "tfng",
        prompt: "Synthetic microRNA-based cancer drugs have already completely replaced surgical tumor removal in European hospitals.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 2,
        para: "E",
        explainVi: "Đoạn E chỉ nói các bác sĩ đang phát triển sinh thiết lỏng và thuốc oligonucleotide tổng hợp, không hề nhắc tới việc đã thay thế phẫu thuật tại châu Âu → NOT GIVEN."
      },
      {
        id: "q3",
        type: "mcq",
        prompt: "Why did many scientists initially underestimate the 1993 discovery of lin-4?",
        options: [
          "A. They believed the roundworm samples had been contaminated by bacteria",
          "B. They assumed the mechanism was an unusual trait restricted to worms rather than humans",
          "C. Transcription factor proteins had not yet been discovered at that time",
          "D. The RNA molecule was too large to observe under electron microscopes"
        ],
        answer: 1,
        para: "C",
        explainVi: "Đoạn C nêu rõ giới khoa học lúc đầu coi đây chỉ là nét kỳ dị tiến hóa riêng ở loài giun tròn ('dismissing it as an evolutionary peculiarity confined to nematodes') → Đáp án B."
      },
      {
        id: "q4",
        type: "mcq",
        prompt: "How does Paragraph D characterize the way microRNAs regulate cellular activity?",
        options: [
          "A. As irreversible enzymes that permanently slice DNA strands",
          "B. As strict one-to-one switches where each microRNA controls exactly one gene",
          "C. As subtle dimmer controls capable of coordinating entire networks of messenger RNAs",
          "D. As energy molecules that transport oxygen into mitochondria"
        ],
        answer: 2,
        para: "D",
        explainVi: "Đoạn D ví microRNA như núm điều chỉnh độ sáng tinh vi ('precision dimmer dials'), trong đó một microRNA có thể điều phối hàng chục mRNA cùng lúc → Đáp án C."
      }
    ]
  },
  {
    id: "sci-09",
    num: 20,
    category: "science",
    tag: "Y học chính xác & Chỉnh sửa gen",
    sourceNote: "Epigenetic CRISPR Editors & p-tau217 Early Alzheimer's Blood Diagnostics",
    passage: 3,
    band: "Passage 3 · 7.5–8.5",
    metrics: { score: 138.8, avgSent: 29.3, c1c2Pct: 27.3, b2PlusPct: 45.0, fkGrade: 20.6 },
    topicId: 6,
    title: "Silencing Genes Without Cutting DNA: Epigenetic Editing and Early Brain Diagnostics",
    titleVi: "Tắt gen không cần cắt DNA: Chỉnh sửa biểu sinh và xét nghiệm máu phát hiện sớm Alzheimer",
    paragraphs: [
      {
        id: "A",
        text: "When first-generation CRISPR-Cas9 gene editing entered clinical medicine, it operated much like molecular scissors: guided by a custom RNA address label, the Cas9 enzyme sliced through both strands of a patient's DNA double helix to disable a faulty gene. Although revolutionary for curing severe blood disorders such as sickle cell disease, double-stranded DNA breaks carry subtle hazards, including unintended chromosomal rearrangements or permanent off-target mutations. In response, molecular engineers have developed a gentler, reversible paradigm known as epigenetic editing, which silences or awakens target genes without severing a single rung of the underlying genetic ladder.",
        gistVi: "Khác với CRISPR thế hệ đầu dùng 'kéo phân tử' cắt đứt hai mạch DNA tiềm ẩn rủi ro đột biến ngoài ý muốn, công nghệ 'chỉnh sửa biểu sinh' mới bật/tắt gen mà không hề cắt chuỗi DNA."
      },
      {
        id: "B",
        text: "Epigenetic editors—often dubbed 'CRISPR-off' and 'CRISPR-on'—rely on a catalytically deadened Cas protein whose cutting blades have been deliberately blunted, fused instead to enzymes that attach or erase tiny chemical tags called methyl groups atop a gene's promoter region. When methyl tags blanket a gene's starting line, cellular machinery tightly spools that stretch of DNA, rendering it unreadable even though its nucleotide letters remain completely intact. Preclinical and early human trials targeting PCSK9—a liver gene governing blood cholesterol—demonstrated that a single lipid-nanoparticle infusion of an epigenetic editor durably lowered harmful LDL cholesterol for months while preserving full reversibility if clinically needed.",
        gistVi: "Công cụ CRISPR-off dùng protein Cas đã làm cùn lưỡi cắt để gắn nhãn hóa học methyl lên vùng khởi động gen, giúp hạ mỡ máu xấu bền vững nhiều tháng mà vẫn có thể đảo ngược an toàn."
      },
      {
        id: "C",
        text: "Parallel precision is transforming neurodegenerative medicine, a field historically frustrated by late diagnosis. For decades, confirming Alzheimer's disease pathology in living patients required either an invasive spinal tap to extract cerebrospinal fluid or an expensive, scarce positron emission tomography brain scan. Consequently, most patients entered clinical drug trials only after irreversible neuronal loss had already eroded memory circuits. Between 2025 and 2026, ultra-sensitive blood assays measuring phosphorylated tau-217—a specific protein fragment shed as brain tangles begin forming—moved into routine clinical practice, matching PET-scan diagnostic accuracy above ninety percent from a simple arm vein draw.",
        gistVi: "Trong thần kinh học, xét nghiệm máu đo dấu ấn sinh học p-tau217 đã đạt độ chính xác trên 90% ngang chụp PET não, giúp phát hiện sớm bệnh Alzheimer nhiều năm trước khi mất trí nhớ."
      },
      {
        id: "D",
        text: "Catching amyloid and tau accumulation fifteen years before cognitive symptoms appear is also illuminating unexpected systemic drivers of brain aging, notably the gut-brain metabolic axis. Multi-omics studies published in 2026 identified elevated blood concentrations of specific microbial metabolites—such as imidazole propionate produced by imbalanced intestinal bacteria—correlating strongly with neuroinflammation and accelerated white-matter deterioration. Meanwhile, clinical trials repurposing metabolic GLP-1 receptor agonists like liraglutide suggested that improving cerebral insulin signaling and dampening vascular inflammation may slow brain volume shrinkage, even as oral drug variants yielded mixed cognitive outcomes.",
        gistVi: "Chẩn đoán sớm còn làm sáng tỏ trục ruột-não khi các chất chuyển hóa từ hệ vi sinh đường ruột ảnh hưởng trực tiếp tới viêm thần kinh, mở ra hướng nghiên cứu thuốc chuyển hóa GLP-1 bảo vệ não."
      },
      {
        id: "E",
        text: "The convergence of predictive blood biomarkers and gentle gene-silencing therapies raises profound ethical and healthcare-delivery questions. Identifying asymptomatic fifty-year-olds carrying early Alzheimer's biomarkers empowers preventive lifestyle interventions and earlier anti-amyloid or epigenetic treatments, yet it also necessitates robust legal protections against health-insurance discrimination and psychological distress. Ultimately, medicine is pivoting from crisis repair—treating failing organs after decades of silent damage—toward molecular interception long before patients ever feel ill.",
        gistVi: "Sự kết hợp giữa xét nghiệm máu dự báo sớm và liệu pháp tắt gen nhẹ nhàng đang chuyển dịch y học từ 'chữa cháy khi bệnh nặng' sang 'đánh chặn phân tử' từ trước khi có triệu chứng, đồng thời đòi hỏi hành lang pháp lý bảo vệ người bệnh."
      }
    ],
    questions: [
      {
        id: "q1",
        type: "tfng",
        prompt: "Epigenetic 'CRISPR-off' editors silence target genes by permanently deleting nucleotide letters from the DNA strand.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 1,
        para: "B",
        explainVi: "Đoạn B khẳng định các chữ cái nucleotide vẫn còn nguyên vẹn hoàn toàn ('even though its nucleotide letters remain completely intact'); công cụ chỉ gắn thẻ hóa học methyl để cuộn chặt DNA → FALSE."
      },
      {
        id: "q2",
        type: "tfng",
        prompt: "Blood tests measuring p-tau217 have achieved over 90 percent diagnostic agreement with traditional PET brain scans.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: 0,
        para: "C",
        explainVi: "Đoạn C nêu rõ xét nghiệm máu đo p-tau217 đạt độ chính xác chẩn đoán tương đương chụp PET trên mức 90% ('matching PET-scan diagnostic accuracy above ninety percent') → TRUE."
      },
      {
        id: "q3",
        type: "mcq",
        prompt: "Why did many past Alzheimer's drug trials struggle to succeed according to Paragraph C?",
        options: [
          "A. Spinal taps inadvertently cured symptoms during screening",
          "B. Patients were typically diagnosed and enrolled only after severe, irreversible brain cell damage had occurred",
          "C. Researchers focused exclusively on liver cholesterol genes",
          "D. PET scanners could only image patients under the age of forty"
        ],
        answer: 1,
        para: "C",
        explainVi: "Đoạn C giải thích do chẩn đoán cũ khó khăn và tốn kém, đa số bệnh nhân chỉ bước vào thử nghiệm lâm sàng sau khi tổn thương nơ-ron không thể hồi phục đã bào mòn mạch trí nhớ → Đáp án B."
      },
      {
        id: "q4",
        type: "mcq",
        prompt: "What social or ethical safeguard does Paragraph E emphasize as early biomarker testing expands?",
        options: [
          "A. Mandatory genetic testing for all newborn infants",
          "B. Prohibiting lifestyle interventions before age seventy",
          "C. Legal protections preventing insurance discrimination against symptom-free individuals with positive biomarkers",
          "D. Replacing human doctors entirely with automated blood-testing kiosks"
        ],
        answer: 2,
        para: "E",
        explainVi: "Đoạn E nhấn mạnh nhu cầu có hành lang pháp lý vững chắc chống phân biệt đối xử bảo hiểm y tế và hỗ trợ tâm lý cho những người chưa có triệu chứng nhưng mang dấu ấn sinh học sớm → Đáp án C."
      }
    ]
  }
];
