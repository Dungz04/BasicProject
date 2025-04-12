import AnhKhongDauPoster from "../assets/Poster/Anh_Khong_Dau.jpg";
import DaredevilPoster from "../assets/Poster/Daredevil.jpg";
import Mickey17Poster from "../assets/Poster/Mickey_17.jpg";
import MinecraftPoster from "../assets/Poster/Minecraft.jpg";
import TheLastOfUsPoster from "../assets/Poster/The_Last_Of_Us.jpg";

import AnhKhongDauBackdrop from "../assets/Backdrops/Anh_Khong_Dau.jpg";
import DaredevilBackdrop from "../assets/Backdrops/Daredevil.jpg";
import Mickey17drop from "../assets/Backdrops/Mickey_17.jpg";
import Minecraftdrop from "../assets/Backdrops/Minecraft.jpg";
import TheLastOfUsdrop from "../assets/Backdrops/The_Last_Of_Us.jpg";

const staticContent = [
    {
        id: 1195506,
        title: "Anh Không Đau",
        media_type: "movie",
        poster_path: AnhKhongDauPoster,
        backdrop_path: AnhKhongDauBackdrop,
        overview:
            "Một người đàn ông không thể cảm nhận nỗi đau thể xác đã biến căn bệnh hiếm gặp của mình thành lợi thế bất ngờ trong cuộc chiến sinh tử để giải cứu cô gái trong mơ.",
        release_date: "2025-03-14",
        vote_average: 6.9,
        runtime: 109,
        certification: "R",
        genres: [
            { name: "Hành động" },
            { name: "Hài" },
            { name: "Gây cấn" },
        ],
    },

    {
        id: 202555,
        name: "Daredevil: Tái Xuất",
        media_type: "tv",
        poster_path: DaredevilPoster,
        backdrop_path: DaredevilBackdrop,
        overview:
            "Bộ phim xoay quanh Matt Murdock (do Charlie Cox thủ vai), một luật sư mù ở Hell’s Kitchen, New York, người sống hai cuộc đời: ban ngày là một luật sư đấu tranh cho công lý, ban đêm là Daredevil – một siêu anh hùng đeo mặt nạ bảo vệ thành phố. Phim lấy bối cảnh vài năm sau các sự kiện của loạt phim Netflix, khi Matt cùng hai người bạn thân là Foggy Nelson (Elden Henson) và Karen Page (Deborah Ann Woll) đã tìm thấy sự ổn định trong cuộc sống với văn phòng luật của họ. Tuy nhiên, sự yên bình này không kéo dài khi Wilson Fisk (Vincent D’Onofrio), tức Kingpin – kẻ thù truyền kiếp của Daredevil, tái xuất với một kế hoạch đầy tham vọng. Không còn hoạt động trong thế giới ngầm như trước, Fisk giờ đây hướng đến chính trường và trở thành một nhân vật quyền lực tại New York, thậm chí có thể là thị trưởng. Mâu thuẫn giữa Matt và Fisk leo thang khi cả hai đối đầu trong một cuộc chiến vừa mang tính cá nhân vừa ảnh hưởng đến cả thành phố.",
        first_air_date: "2025-01-01",
        vote_average: 8.4,
        episode_run_time: [50],
        certification: "TV-MA",
        genres: [
            { name: "Chính kịch" },
            { name: "Hình sự" },
        ],
    },

    {
        id: 696506,
        name: "Mickey 17",
        media_type: "movie",
        poster_path: Mickey17Poster,
        backdrop_path: Mickey17drop,
        overview:
            "Được chuyển thể từ tiểu thuyết Mickey 7 của nhà văn Edward Ashton, Cuốn tiểu thuyết xoay quanh các phiên bản nhân bản vô tính mang tên “Mickey”, dùng để thay thế con người thực hiện cuộc chinh phạt nhằm thuộc địa hóa vương quốc băng giá Niflheim. Mỗi khi một Mickey chết đi, một Mickey mới sẽ được tạo ra, với phiên bản được đánh số 1, 2, 3 tiếp theo. Mickey số 7 được cho rằng đã chết, để rồi một ngày kia, hắn quay lại và bắt gặp phiên bản tiếp theo của mình.",
        release_date: "2025-03-07",
        vote_average: 7.0,
        run_time: 137,
        certification: "15",
        genres: [
            { name: "Khoa học viễn tưởng" },
            { name: "Hài" },
            { name: "Phiêu lưu" },
        ],
    },

    {
        id: 950387,
        name: "Minecraft",
        media_type: "movie",
        poster_path: MinecraftPoster,
        backdrop_path: Minecraftdrop,
        overview:
            "Bốn kẻ lập dị thấy mình đang vật lộn với những vấn đề thường ngày khi họ đột nhiên bị kéo qua một cánh cổng bí ẩn vào Overworld: một xứ sở thần tiên hình khối kỳ lạ phát triển mạnh mẽ nhờ trí tưởng tượng. Để trở về nhà, họ sẽ phải làm chủ thế giới này trong khi bắt đầu một nhiệm vụ kỳ diệu với một thợ thủ công chuyên nghiệp bất ngờ, Steve.",
        release_date: "2025-04-04",
        vote_average: 6.0,
        run_time: 101,
        certification: "PG",
        genres: [
            { name: "Gia đình" },
            { name: "Hài" },
            { name: "Phiêu lưu" },
            { name: "Giả tượng" },
        ],
    },

    {
        id: 100088,
        name: "Những người còn sót lại",
        media_type: "tv",
        poster_path: TheLastOfUsPoster,
        backdrop_path: TheLastOfUsdrop,
        overview:
            "Được chuyển thể từ tựa game nổi tiếng cùng tên, The Last of Us là câu chuyện về thế giới giữa đại dịch xác sống. Đó là nơi mà Joel và Ellie, một cặp đôi được kết nối với nhau nhờ sự khắc nghiệt của thế giới, buộc phải dựa vào nhau giữa những hoàn cảnh tàn khốc trong chuyến hành trình xuyên nước Mỹ thời hậu đại dịch.",
        release_date: "2023",
        vote_average: 8.6,
        run_time: 101,
        certification: "TV-MA",
        genres: [
            { name: "Chính kịch" },
        ],
    },
];

export default staticContent;