import React from "react";
import "../../styles/cssMovieDetails/MovieActions.css";

const MovieActions = ({ movieId }) => {
    return (
        <div className="dm-bar">
            <div className="elements">
                <a className="btn btn-xl btn-rounded button-play flex-shrink-0" href={`/xem-phim/${movieId}`}>
                    <i className="fa-solid fa-play" />
                    <span>Xem Ngay</span>
                </a>
                <div className="touch-group flex-grow-1">
                    <div className="is-left flex-grow-1">
                        <div className="item item-like">
                            <a className="item-v">
                                <div className="inc-icon icon-16">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <g clipPath="url(#clip0_49_76)">
                                            <path
                                                d="M10 18.1432L1.55692 9.82794C0.689275 8.97929 0.147406 7.85276 0.0259811 6.64517C-0.0954433 5.43759 0.211298 4.22573 0.892612 3.22133C4.99987 -2.24739 10 4.10278 10 4.10278C10 4.10278 15.0001 -2.24739 19.1074 3.22133C19.7887 4.22573 20.0954 5.43759 19.974 6.64517C19.8526 7.85276 19.3107 8.97929 18.4431 9.82794L10 18.1432Z"
                                                fill="currentColor"
                                            />
                                        </g>
                                    </svg>
                                </div>
                                <span>Yêu thích</span>
                            </a>
                        </div>
                        <div className="dropdown">
                            <div className="item item-playlist">
                                <a className="item-v">
                                    <div className="inc-icon icon-16">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" fill="none">
                                            <path
                                                d="M89.7273 41.6365H58.3635V10.2727C58.3635 6.81018 55.5534 4 52.0908 4H47.9092C44.4466 4 41.6365 6.81018 41.6365 10.2727V41.6365H10.2727C6.81018 41.6365 4 44.4466 4 47.9092V52.0908C4 55.5534 6.81018 58.3635 10.2727 58.3635H41.6365V89.7273C41.6365 93.1898 44.4466 96 47.9092 96H52.0908C55.5534 96 58.3635 93.1898 58.3635 89.7273V58.3635H89.7273C93.1898 58.3635 96 55.5534 96 52.0908V47.9092C96 44.4466 93.1898 41.6365 89.7273 41.6365Z"
                                                fill="currentColor"
                                            />
                                        </svg>
                                    </div>
                                    <span>Thêm vào</span>
                                </a>
                            </div>
                        </div>
                        <div className="item item-share">
                            <a className="item-v" title="Chia sẻ">
                                <div className="inc-icon icon-16">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                                        <path
                                            d="M16.3628 0.651489C15.946 0.223669 15.3291 0.0642849 14.7538 0.232058L1.34002 4.13277C0.733102 4.30139 0.302926 4.78541 0.187045 5.4003C0.0686637 6.02609 0.482166 6.82049 1.02239 7.15268L5.2166 9.73051C5.64678 9.99475 6.20201 9.92848 6.55799 9.56945L11.3608 4.73676C11.6026 4.4851 12.0027 4.4851 12.2445 4.73676C12.4862 4.98003 12.4862 5.37429 12.2445 5.62595L7.43334 10.4595C7.07653 10.8177 7.00984 11.3755 7.27245 11.8084L9.83516 16.0446C10.1353 16.548 10.6522 16.8332 11.2191 16.8332C11.2858 16.8332 11.3608 16.8332 11.4275 16.8248C12.0777 16.7409 12.5946 16.2963 12.7864 15.6671L16.763 2.2705C16.9381 1.70007 16.7797 1.07931 16.3628 0.651489Z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                </div>
                                <span>Chia sẻ</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieActions;