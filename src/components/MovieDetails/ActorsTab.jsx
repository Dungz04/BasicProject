
import React from "react";

const ActorsTab = ({ actors = [], active, loading = false, title }) => {
    if (loading) {
        return (
            <div className={`fade tab-pane ${active ? "active show" : ""}`}>
                <div className="bg-[#1a1a1a] rounded-lg !p-4 sm:p-6">
                    <h3 className="text-white font-bold text-xl sm:text-2xl lg:text-3xl text-center !mb-4">
                        Diễn viên
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, index) => (
                            <div
                                key={index}
                                className="w-full bg-[#2a2a2a] rounded-lg !p-3 animate-pulse"
                            >
                                <div className="w-full aspect-[2/3] bg-[#3a3a3a] rounded-lg"></div>
                                <div className="!mt-3 space-y-2">
                                    <div className="h-4 w-4/5 mx-auto bg-[#3a3a3a] rounded"></div>
                                    <div className="h-3 w-3/5 mx-auto bg-[#3a3a3a] rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const castListName = actors?.data?.castName
        ? typeof actors.data.castName === "string"
            ? actors.data.castName.split(",").map((item) => item.trim())
            : Array.isArray(actors.data.castName)
            ? actors.data.castName
            : []
        : [];

    const castListData = actors?.data?.castData
        ? typeof actors.data.castData === "string"
            ? actors.data.castData.split(",").map((item) => item.trim())
            : Array.isArray(actors.data.castData)
            ? actors.data.castData
            : []
        : [];

    return (
        <div className={`fade tab-pane ${active ? "active show" : ""}`}>
            <div className="bg-[#1a1a1a] rounded-lg !p-4 sm:p-6">
                <h3 className="text-white font-bold text-xl sm:text-2xl lg:text-3xl text-center !mb-4">
                    Diễn viên
                </h3>
                {castListName.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {castListName.map((actor, index) => (
                            <div
                                key={index}
                                className="bg-[#1e1e2a] rounded-lg overflow-hidden text-center text-white !p-3 transition-transform duration-300 "
                            >
                                <a
                                    
                                    className="block w-full aspect-[2/3] overflow-hidden"
                                    aria-label={`Xem thông tin diễn viên ${actor || "Không xác định"}`}
                                >
                                    <img
                                        src={`${import.meta.env.VITE_API_BASE_URL}/assets/get_assets_web?linkAssets=${
                                            castListData[index]
                                        }&nameTag=cast&nameMovie=${title}`}
                                        alt={`Ảnh của ${actor || "diễn viên không xác định"}`}
                                        loading="lazy"
                                        className="w-full h-full object-cover rounded-lg transition-transform duration-300 "
                                    />
                                </a>
                                <div className="!mt-3">
                                    <h4 className="text-sm sm:text-base font-semibold">
                                        <a
                        
                                            className="text-white hover:text-[#e50914] transition-colors duration-300"
                                        >
                                            {actor || "Không xác định"}
                                        </a>
                                    </h4>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-white text-base !p-8 bg-[#2a2a2a] rounded-lg w-full">
                        Không có thông tin diễn viên
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActorsTab;
