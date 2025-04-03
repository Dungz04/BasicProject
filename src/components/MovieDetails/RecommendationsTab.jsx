import React from "react";
import "../../styles/cssMovieDetails/RecommendationsTab.css";

const RecommendationsTab = ({ recommendations = [], active }) => {
    console.log("RecommendationsTab active:", active);
    console.log("Recommendations in RecommendationsTab:", recommendations);

    return (
        <div className={`fade tab-pane ${active ? "active show" : ""}`}>
            <div className="cg-body-box is-suggest">
                <div className="box-header">
                    <div className="heading-md">Có thể bạn sẽ thích</div>
                </div>
                <div className="box-body">
                    <div className="cards-grid-wrapper">
                        {recommendations.length > 0 ? (
                            recommendations.map((rec) => {
                                const isSeries = rec.media_type === "tv" || !rec.title; // Xác định type
                                const type = isSeries ? "tv" : "movie";
                                const title = rec.title || rec.name || "Không có tiêu đề";

                                return (
                                    <div className="sw-item" key={rec.id}>
                                        <a className="v-thumbnail" href={`/phim/${rec.id}?type=${type}`}>
                                            <img
                                                src={
                                                    rec.poster_path
                                                        ? `https://image.tmdb.org/t/p/w300${rec.poster_path}`
                                                        : "https://via.placeholder.com/300x450?text=No+Image"
                                                }
                                                alt={`Xem ${title}`}
                                                loading="lazy"
                                            />
                                        </a>
                                        <div className="info">
                                            <h4 className="item-title">
                                                <a href={`/phim/${rec.id}?type=${type}`}>{title}</a>
                                            </h4>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="no-recommendations">Không có nội dung gợi ý nào</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecommendationsTab;