import React from "react";
import EpisodesTab from "./EpisodesTab";
import ActorsTab from "./ActorsTab";
import RecommendationsTab from "./RecommendationsTab";

const TabsContent = ({ activeTab, setActiveTab, movie, actors, recommendations }) => {
    return (
        <div className="!px-8 flex flex-col gap-8 md:px-4">
            <div className="border-b-2 border-neutral-700 ">
                <div className="flex gap-4 flex-wrap cursor-pointer">
                    <a
                        className={`text-white font-bold uppercase !py-3 !px-3 border-b-4  transition-all duration-300 hover:border-red-700 ${activeTab === "episodes" ? "border-red-700" : "border-transparent"
                            }`}
                        onClick={() => setActiveTab("episodes")}
                    >
                        Tập phim
                    </a>
                    <a
                        className={`text-white font-bold uppercase !py-3 !px-3 border-b-4 transition-all duration-300 hover:border-red-700 ${activeTab === "actors" ? "border-red-700" : "border-transparent"
                            }`}
                        onClick={() => setActiveTab("actors")}
                    >
                        Diễn viên
                    </a>
                    <a
                        className={`text-white font-bold uppercase !py-3 !px-3 border-b-4 transition-all duration-300 hover:border-red-700 ${activeTab === "recommendations" ? "border-red-700" : "border-transparent"
                            }`}
                        onClick={() => setActiveTab("recommendations")}
                    >
                        Đề xuất
                    </a>
                </div>
            </div>

            <div >
                {activeTab === "episodes" && (
                    <div className="bg-neutral-900 rounded-lg shadow-lg text-white animate-[fadeIn_0.3s_ease-in-out_forwards]">
                        <EpisodesTab movie={movie} />
                    </div>
                )}
                {activeTab === "actors" && (
                    <div className="bg-neutral-900 rounded-lg shadow-lg text-white animate-[fadeIn_0.3s_ease-in-out_forwards]">
                        <ActorsTab actors={actors} title={movie.title} />
                    </div>
                )}
                {activeTab === "recommendations" && (
                    <div className="bg-neutral-900 rounded-lg shadow-lg text-white animate-[fadeIn_0.3s_ease-in-out_forwards]">
                        <RecommendationsTab recommendations={recommendations} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default TabsContent;
