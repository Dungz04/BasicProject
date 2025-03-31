import React from "react";
import "../../styles/cssMovieDetails/MovieInfo.css";

const MovieInfo = ({ movie }) => {
    const toggleDetail = () => {
        if (window.innerWidth <= 768) {
            const detailSection = document.querySelector(".detail-more");
            detailSection.style.display = detailSection.style.display === "none" || !detailSection.style.display ? "block" : "none";
        }
    };

    return (
        <div className="ds-info">
            <div className="v-thumb-l mb-3">
                <div className="d-thumbnail">
                    <img
                        src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                        alt={`Xem Phim ${movie.title} Vietsub HD Online`}
                        loading="lazy"
                    />
                </div>
            </div>
            <h2 className="heading-md media-name">{movie.title}</h2>
            <div className="alias-name">{movie.original_title}</div>
            <div id="toggle-detail" className="btn btn-block btn-basic primary-text mb-2" onClick={toggleDetail}>
                <span>Thông tin phim</span>
                <i className="fa-solid fa-angle-down ms-2" />
            </div>
            <div className="detail-more" style={{ display: window.innerWidth > 768 ? "block" : "none" }}>
                <div className="hl-tags">
                    <div className="tag-tmdb">
                        <span>TMDB {movie.vote_average.toFixed(1)}</span>
                    </div>
                    <div className="tag-model">
                        <span className="last">{movie.certification}</span>
                    </div>
                    <div className="tag-classic">
                        <span>{movie.release_date?.split("-")[0]}</span>
                    </div>
                    <div className="tag-classic">
                        <span>{movie.runtime} phút</span>
                    </div>
                </div>
                <div className="hl-tags mb-4">
                    {movie.genres?.map((genre) => (
                        <a key={genre.id} className="tag-topic" href={`/the-loai/${genre.name.toLowerCase()}`}>
                            {genre.name}
                        </a>
                    ))}
                </div>
                <div className="detail-line">
                    <div className="de-title d-block mb-2">Giới thiệu:</div>
                    <div className="description">{movie.overview || "Không có mô tả"}</div>
                </div>
                <div className="detail-line d-flex">
                    <div className="de-title">Thời lượng:</div>
                    <div className="de-value">{movie.runtime} phút</div>
                </div>
                <div className="detail-line d-flex">
                    <div className="de-title">Quốc gia:</div>
                    <div className="de-value">
                        {movie.production_countries?.map((country, index) => (
                            <span key={country.iso_3166_1}>
                                <a href={`/quoc-gia/${country.iso_3166_1.toLowerCase()}`}>{country.name}</a>
                                {index < movie.production_countries.length - 1 && " • "}
                            </span>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default MovieInfo;