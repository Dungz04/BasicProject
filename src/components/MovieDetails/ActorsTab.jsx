import React from "react";
import "../../styles/cssMovieDetails/ActorsTab.css";

const ActorsTab = ({ actors = [], active, loading = false }) => {
    console.log("ActorsTab active:", active);
    console.log("Actors in ActorsTab:", actors);

    // Nếu đang loading, hiển thị skeleton UI
    if (loading) {
        return (
            <div className={`fade tab-pane ${active ? "active show" : ""}`}>
                <div className="cg-body-box is-actors">
                    <div className="box-header">
                        <div className="heading-md">Diễn viên</div>
                    </div>
                    <div className="box-body">
                        <div className="de-actors">
                            {[...Array(4)].map((_, index) => (
                                <div className="item-actor skeleton" key={index}>
                                    <div className="v-item">
                                        <div className="v-actor">
                                            <div className="skeleton-image"></div>
                                        </div>
                                        <div className="info">
                                            <h4 className="item-title skeleton-title"></h4>
                                            <div className="du-play skeleton-text"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Determine the appropriate class based on the number of actors
    const getActorsClass = () => {
        if (actors.length === 1) return "single-actor";
        if (actors.length === 2) return "two-actors";
        return "";
    };

    return (
        <div className={`fade tab-pane ${active ? "active show" : ""}`}>
            <div className="cg-body-box is-actors">
                <div className="box-header">
                    <div className="heading-md">Diễn viên</div>
                </div>
                <div className="box-body">
                    <div className={`de-actors ${getActorsClass()}`}>
                        {actors.length > 0 ? (
                            actors.map((actor) => (
                                <div className="item-actor" key={actor.id}>
                                    <div className="v-item">
                                        <a
                                            className="v-actor"
                                            href={`/dien-vien/${actor.id}`}
                                            aria-label={`Xem thông tin diễn viên ${actor.name}`}
                                        >
                                            <img
                                                src={
                                                    actor.profile_path
                                                        ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
                                                        : "https://via.placeholder.com/150?text=No+Image"
                                                }
                                                alt={actor.name || "Diễn viên không xác định"}
                                                loading="lazy"
                                            />
                                        </a>
                                        <div className="info">
                                            <h4 className="item-title">
                                                <a href={`/dien-vien/${actor.id}`}>
                                                    {actor.name || "Không xác định"}
                                                </a>
                                            </h4>
                                            <div className="du-play">
                                                <span>{actor.character || "Không có vai diễn"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-actors">Không có thông tin diễn viên</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActorsTab;