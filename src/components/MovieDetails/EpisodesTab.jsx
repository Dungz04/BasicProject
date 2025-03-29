import React from "react";
import "../../styles/cssMovieDetails/EpisodesTab.css";

const EpisodesTab = ({ movie, active }) => {
    console.log("EpisodesTab active:", active); // Kiểm tra trạng thái active
    return (
        <div className={`fade tab-pane ${active ? "active show" : ""}`}>
            <div className="cg-body-box is-eps">
                <div className="box-header">
                    <div className="heading-md">Các bản chiếu</div>
                </div>
                <div className="box-body">
                    <div className="de-type">
                        <a className="item pd" href={`/xem-phim/${movie.id}`}>
                            <div className="m-thumbnail">
                                <img src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`} alt={movie.title} />
                            </div>
                            <div className="info">
                                <div className="ver line-center"><span>Phụ đề</span></div>
                                <div className="media-title">{movie.title}</div>
                                <div className="btn btn-sm btn-light">Xem bản này</div>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EpisodesTab;