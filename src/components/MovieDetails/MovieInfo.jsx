import React from "react";

const countryMapping = {
    US: "United States",
    JP: "Japan",
    KR: "South Korea",
    CN: "China",
    GB: "United Kingdom",
    FR: "France",
    DE: "Germany",
    IT: "Italy",
    ES: "Spain",
    CA: "Canada",
    AU: "Australia",
    IN: "India",
    BR: "Brazil",
    MX: "Mexico",
    RU: "Russia",
};

const MovieInfo = ({ movie }) => {
    const toggleDetail = () => {
        if (window.innerWidth <= 768) {
            const detailSection = document.querySelector(".detail-more");
            if (detailSection) {
                detailSection.style.display =
                    detailSection.style.display === "none" || !detailSection.style.display
                        ? "block"
                        : "none";
            }
        }
    };

    const title = movie.title || "Không có tiêu đề";
    const originalTitle = movie.title || title;
    const releaseYear = movie.releaseYear || "N/A";
    const duration = movie.duration ? `${movie.duration} phút` : "N/A";
    const displayCountries = movie.country;
    const genreList = typeof movie.genres === 'string'
        ? movie.genres.split(',').map(genre => ({ name: genre.trim() }))
        : Array.isArray(movie.genres)
            ? movie.genres
            : [];

    return (
        <div className="w-full font-light">
            <div className="flex justify-center items-center w-full !mb-3">
                <div className="flex justify-center h-53 w-full">
                    <img
                        src={
                            `${import.meta.env.VITE_API_BASE_URL}/assets/get_assets_web?linkAssets=${movie.imageUrl}&nameTag=poster`
                        }
                        alt={`Xem Phim ${title} Vietsub HD Online`}
                        loading="lazy"
                        className=" rounded-lg shadow-[0_2px_10px_rgba(255,255,255,0.2)] md:w-[50%] md:max-w-[150px]"
                    />
                </div>
            </div>

            <h2 className="text-center text-white text-[1.5rem] font-bold !mb-2 !md:text-[1.2rem]">{title}</h2>
            <div className="text-center text-gray-400 text-base !mb-4 !md:text-sm">{originalTitle}</div>

            <div
                id="toggle-detail"
                className="block md:hidden w-full !py-3 !px-4 text-center bg-gradient-to-tr from-red-600 to-red-900 text-white rounded-lg text-lg font-medium cursor-pointer !mb-4 hover:from-red-700 hover:to-red-800 transition-all duration-300"
                onClick={toggleDetail}
            >
                <span>Thông tin {"phim"}</span>
                <i className="fa-solid fa-angle-down !ml-2 transition-transform duration-300 group-hover:rotate-180" />
            </div>

            <div
                className="detail-more animate-fadeIn"
                style={{ display: window.innerWidth > 768 ? "block" : "none" }}
            >
                <div className="flex flex-wrap justify-center gap-2 !mt-4 !mb-2">
                    <span className="border border-red-600 rounded-md text-white font-medium text-xs !px-2 !py-1.5 hover:bg-red-600/20 transition">
                        TMDb {movie.rating ? movie.rating.toFixed(1) : "N/A"}
                    </span>
                    <span className="bg-white text-black font-medium text-sm !px-2 !py-1.5 rounded-md">
                        {movie.status || "N/A"}
                    </span>
                    <span className="bg-white/10 text-white text-xs !px-2 !py-1.5 rounded-md hover:bg-white/20 transition">
                        {releaseYear}
                    </span>
                    <span className="bg-white/10 text-white text-xs !px-2 !py-1.5 rounded-md hover:bg-white/20 transition">
                        {duration}
                    </span>
                </div>

                <div className="flex flex-wrap justify-center gap-2 !mb-4">
                    {genreList.length > 0 ? (
                        genreList.map((genre, index) => (
                            <span key={index} className="bg-neutral-800 text-white text-xs !px-3 !py-2 rounded-md hover:bg-gradient-to-tr hover:from-red-500 hover:to-red-900 transition-transform duration-200 ">
                                {genre.name}
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-400 text-sm">Không có thông tin thể loại</span>
                    )}
                </div>

                <div className="!mb-2">
                    <div className="text-white font-medium !mb-1 text-lg">Giới thiệu:</div>
                    <div className="text-gray-300 text-sm leading-relaxed">{movie.overviewString || "Không có mô tả"}</div>
                </div>

                <div className="flex gap-2 items-start !mb-1">
                    <div className="font-bold text-white">Thời lượng:</div>
                    <div className="text-gray-300">{duration}</div>
                </div>

                <div className=" gap-2 items-start">
                    <div className="font-bold text-white">Quốc gia:</div>
                    <div className="text-gray-300 flex flex-wrap gap-1">
                        {displayCountries.length > 0 ? (
                            <span className="text-gray-400">{displayCountries}</span>
                        ) : (
                            <span className="text-gray-400">Không có thông tin quốc gia</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieInfo;
