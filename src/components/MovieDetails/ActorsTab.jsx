import React from "react";

const ActorsTab = ({ actors = [], active, loading = false }) => {
    if (loading) {
        return (
            <div className={`fade tab-pane ${active ? "active show" : ""}`}>
                <div className="bg-[#1a1a1a] rounded-lg !p-4">
                    <div className="!mb-4">
                        <div className="text-white font-bold text-[clamp(1.5rem,3vw,2rem)] !pl-4 text-center">Diễn viên</div>
                    </div>
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4 !p-4">
                        {[...Array(4)].map((_, index) => (
                            <div className="w-full bg-[#2a2a2a] rounded-lg !p-2 animate-pulse" key={index}>
                                <div className="w-full aspect-[2/3] bg-[#3a3a3a] rounded-lg"></div>
                                <div className="!mt-2">
                                    <div className="h-4 w-4/5 mx-auto bg-[#3a3a3a] rounded !mb-2"></div>
                                    <div className="h-3 w-3/5 mx-auto bg-[#3a3a3a] rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const getActorsClass = () => {
        if (actors.length === 1) return "flex justify-start gap-0";
        if (actors.length === 2) return "flex flex-wrap justify-start gap-4";
        return "grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4";
    };

    return (
        <div className={`fade tab-pane ${active ? "active show" : ""}`}>
            <div className="bg-[#1a1a1a] rounded-lg !p-4">
                <div className="!mb-4">
                    <div className="text-white font-bold text-3xl text-center !pl-4">Diễn viên</div>
                </div>
                <div className={`${getActorsClass()} !p-4`}>
                    {actors.length > 0 ? (
                        actors.map((actor) => (
                            <div
                                key={actor.id}
                                className="bg-[#1e1e2a] rounded-lg overflow-hidden text-center text-white !p-2 transition-transform duration-300  active:scale-[0.98] w-full max-w-[200px]"
                            >
                                <div className="w-full">
                                    <a
                                        className="block w-full aspect-[2/3] overflow-hidden"
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
                                            className="w-full h-full object-cover rounded-lg transition-transform duration-300 hover:-translate-y-1"
                                        />
                                    </a>
                                    <div className="!mt-2">
                                        <h4 className="text-base font-bold">
                                            <span
                                                href={`/dien-vien/${actor.id}`}
                                                className="text-white hover:text-[#e50914] transition-colors duration-300"
                                            >
                                                {actor.name || "Không xác định"}
                                            </span>
                                        </h4>
                                        <div className="text-sm text-gray-400 !mt-1">
                                            <span>{actor.character || "Không có vai diễn"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-white text-base p-8 bg-[#2a2a2a] rounded-lg w-full">
                            Không có thông tin diễn viên
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActorsTab;
