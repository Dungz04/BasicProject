import React from "react";
import "../../styles/cssMovieDetails/MovieInfo.css";

// Danh sách ánh xạ mã quốc gia sang tên đầy đủ
const countryMapping = {
    US: "United States",
    JP: "Japan",
    KR: "South Korea",
    CN: "China",
    GB: "United Kingdom",
    FR: "France",
    DE: "Germany",
    IT: "Italy",
    ES: "Spain",
    CA: "Canada",
    AU: "Australia",
    IN: "India",
    BR: "Brazil",
    MX: "Mexico",
    RU: "Russia",
    // Thêm các quốc gia khác nếu cần
};

const MovieInfo = ({ movie }) => {
    const isSeries = movie.type === "tv"; // Kiểm tra xem nội dung có phải TV series không

    const toggleDetail = () => {
        if (window.innerWidth <= 768) {
            const detailSection = document.querySelector(".detail-more");
            if (detailSection) {
                detailSection.style.display =
                    detailSection.style.display === "none" || !detailSection.style.display
                        ? "block"
                        : "none";
            }
        }
    };

    // Xử lý các thuộc tính linh hoạt giữa movie và TV
    const title = movie.title || movie.name || "Không có tiêu đề";
    const originalTitle = movie.original_title || movie.original_name || title;
    const releaseYear = (movie.release_date || movie.first_air_date)?.split("-")[0] || "N/A";
    const duration = isSeries
        ? movie.number_of_seasons
            ? `${movie.number_of_seasons} Phần`
            : "N/A"
        : movie.runtime
        ? `${movie.runtime} phút`
        : "N/A";
    // Tính thời lượng trung bình của các tập
    const episodeDuration = isSeries
        ? movie.episode_run_time?.length > 0
            ? `${Math.round(
                  movie.episode_run_time.reduce((a, b) => a + b, 0) / movie.episode_run_time.length
              )} phút/tập`
            : "N/A"
        : null;
    const countries = isSeries ? (movie.origin_country || []) : (movie.production_countries || []);

    // Chuyển mã quốc gia thành tên đầy đủ cho TV series
    const displayCountries = isSeries
        ? countries.map((code) => countryMapping[code] || code)
        : countries.map((country) => country.name);

    return (
        <div className="ds-info">
            <div className="v-thumb-l mb-3">
                <div className="d-thumbnail">
                    <img
                        src={
                            movie.poster_path
                                ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                                : "https://via.placeholder.com/300x450?text=No+Image"
                        }
                        alt={`Xem Phim ${title} Vietsub HD Online`}
                        loading="lazy"
                    />
                </div>
            </div>
            <h2 className="heading-md media-name">{title}</h2>
            <div className="alias-name">{originalTitle}</div>
            <div id="toggle-detail" className="btn btn-block btn-basic primary-text mb-2" onClick={toggleDetail}>
                <span>Thông tin {isSeries ? "series" : "phim"}</span>
                <i className="fa-solid fa-angle-down ms-2" />
            </div>
            <div className="detail-more" style={{ display: window.innerWidth > 768 ? "block" : "none" }}>
                <div className="hl-tags">
                    <div className="tag-tmdb">
                        <span>TMDb {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}</span>
                    </div>
                    <div className="tag-model">
                        <span className="last">{movie.certification || "N/A"}</span>
                    </div>
                    <div className="tag-classic">
                        <span>{releaseYear}</span>
                    </div>
                    <div className="tag-classic">
                        <span>{duration}</span>
                    </div>
                </div>
                <div className="hl-tags mb-4">
                    {movie.genres?.length > 0 ? (
                        movie.genres.map((genre) => (
                            <a key={genre.id} className="tag-topic" href={`/the-loai/${genre.name.toLowerCase()}`}>
                                {genre.name}
                            </a>
                        ))
                    ) : (
                        <span className="no-info">Không có thông tin thể loại</span>
                    )}
                </div>
                <div className="detail-line">
                    <div className="de-title d-block mb-2">Giới thiệu:</div>
                    <div className="description">{movie.overview || "Không có mô tả"}</div>
                </div>
                <div className="detail-line d-flex">
                    <div className="de-title">{isSeries ? "Số phần:" : "Thời lượng:"}</div>
                    <div className="de-value">{duration}</div>
                </div>
                {isSeries && (
                    <div className="detail-line d-flex">
                        <div className="de-title">Thời lượng mỗi tập:</div>
                        <div className="de-value">{episodeDuration}</div>
                    </div>
                )}
                <div className="detail-line d-flex">
                    <div className="de-title">Quốc gia:</div>
                    <div className="de-value">
                        {displayCountries.length > 0 ? (
                            displayCountries.map((countryName, index) => (
                                <span key={countryName}>
                                    <a href={`/quoc-gia/${(isSeries ? countries[index] : countryName).toLowerCase()}`}>
                                        {countryName}
                                    </a>
                                    {index < displayCountries.length - 1 && " • "}
                                </span>
                            ))
                        ) : (
                            <span className="no-info">Không có thông tin quốc gia</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieInfo;