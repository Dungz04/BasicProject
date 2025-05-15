import React from "react";

const RecommendationsTab = ({ recommendations = [], active }) => {
    return (
        <div className={`fade tab-pane ${active ? "active show" : ""}`}>
            <div className="!p-6 bg-[#1a1a1a] rounded-xl max-w-6xl mx-auto shadow-md">
                <h2 className="text-white text-2xl md:text-3xl font-bold !mb-6 text-center">
                    Có thể bạn sẽ thích
                </h2>

                {recommendations.length > 0 ? (
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-6">
                        {recommendations.map((rec) => {
                            const isSeries = rec.media_type === "tv" || !rec.title;
                            const type = isSeries ? "tv" : "movie";
                            const title = rec.title || rec.name || "Không có tiêu đề";

                            return (
                                <div
                                    key={rec.id}
                                    className="bg-[#2a2a2a] rounded-xl overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-2xl"
                                >
                                    <a
                                        href={`/phim/${rec.id}?type=${type}`}
                                        className="block group relative"
                                        aria-label={`Xem ${title}`}
                                    >
                                        <img
                                            src={
                                                rec.poster_path
                                                    ? `https://image.tmdb.org/t/p/w300${rec.poster_path}`
                                                    : "https://via.placeholder.com/300x450?text=No+Image"
                                            }
                                            alt={title}
                                            loading="lazy"
                                            className="w-full h-[24redam] sm:h-[22rem] object-cover rounded-t-xl transition-transform duration-300 group-hover:brightness-110 group-hover:contrast-110"
                                        />
                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl" />
                                    </a>
                                    <div className="!px-3 !py-2 bg-[#1e1e1e] rounded-b-xl">
                                        <h4 className="text-white text-sm sm:text-base font-medium truncate text-center hover:text-[#e50914] transition-colors">
                                            <a href={`/phim/${rec.id}?type=${type}`}>{title}</a>
                                        </h4>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-center text-gray-400 italic !py-6 text-base">
                        Không có nội dung gợi ý nào
                    </p>
                )}
            </div>
        </div>
    );
};

export default RecommendationsTab;
