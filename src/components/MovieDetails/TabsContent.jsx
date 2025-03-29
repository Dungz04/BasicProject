import React from "react";
import EpisodesTab from "./EpisodesTab";
import ActorsTab from "./ActorsTab";
import RecommendationsTab from "./RecommendationsTab";
import "../../styles/cssMovieDetails/TabsContent.css";

const TabsContent = ({ activeTab, setActiveTab, movie, actors, recommendations }) => {
    console.log("Current activeTab:", activeTab);

    return (
        <div className="content-gap">
            <div className="cg-body">
                <div className="cg-tabs">
                    <div className="v-tabs nav nav-tabs">
                        <a
                            className={`nav-link ${activeTab === "episodes" ? "active" : ""}`}
                            onClick={() => {
                                console.log("Switching to episodes");
                                setActiveTab("episodes");
                            }}
                        >
                            Tập phim
                        </a>
                        <a
                            className={`nav-link ${activeTab === "actors" ? "active" : ""}`}
                            onClick={() => {
                                console.log("Switching to actors");
                                setActiveTab("actors");
                            }}
                        >
                            Diễn viên
                        </a>
                        <a
                            className={`nav-link ${activeTab === "recommendations" ? "active" : ""}`}
                            onClick={() => {
                                console.log("Switching to recommendations");
                                setActiveTab("recommendations");
                            }}
                        >
                            Đề xuất
                        </a>
                    </div>
                </div>
                <div className="tab-content">
                    <EpisodesTab movie={movie} active={activeTab === "episodes"} />
                    <ActorsTab actors={actors} active={activeTab === "actors"} />
                    <RecommendationsTab recommendations={recommendations} active={activeTab === "recommendations"} />
                </div>
            </div>
        </div>
    );
};

export default TabsContent;