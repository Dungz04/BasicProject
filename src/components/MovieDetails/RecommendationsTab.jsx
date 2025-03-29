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
                            recommendations.map((rec) => (
                                <div className="sw-item" key={rec.id}>
                                    <a className="v-thumbnail" href={`/phim/${rec.id}`}>
                                        <img src={`https://image.tmdb.org/t/p/w300${rec.poster_path}`} alt={rec.title} />
                                    </a>
                                    <div className="info">
                                        <h4 className="item-title">
                                            <a href={`/phim/${rec.id}`}>{rec.title}</a>
                                        </h4>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>Không có phim gợi ý</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecommendationsTab;