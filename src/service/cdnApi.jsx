import axios from "axios";

const cdnApi = {
    baseUrl: import.meta.env.VITE_API_BASE_URL,

    getContentDetails: async (id) => {

        if (!id || isNaN(id)) {
            console.error("⚠️ Invalid content ID");
            throw new Error("ID nội dung không hợp lệ");
        }

        try {
            const response = await axios.get(`${cdnApi.baseUrl}/movies/get/${id}`);

            let data = response.data;

            // console.log("📦 JAKI DATA:\n", JSON.stringify(data, null, 2));

            return data;

        } catch (error) {
            if (error.response?.status === 404) {
                console.error(`❌ Content with ID ${id} not found for type ${type}`);
                throw new Error(`Nội dung với ID ${id} không tồn tại`);
            }
            console.error("⚠️ Lỗi khi lấy chi tiết nội dung:", error);
            throw new Error("Lỗi khi lấy chi tiết nội dung");
        }
    },


    getAssets: async (linkAssets, nameTag) => {
        const response = await axios.get(`${cdnApi.baseUrl}/assets/get_assets?linkAssets=${linkAssets}&nameTag=${nameTag}`);
        return response.data;
    },

    getCastList: async (nameMovie) => {
        const response = await axios.get(`${cdnApi.baseUrl}/assets/get_cast_list?nameMovie=${nameMovie}`);
        return response.data;
    }

};

export default cdnApi;
