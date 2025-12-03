import axios from "axios";


axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

// GLOBAL INTERCEPTOR (runs on every response error)
// axios.interceptors.response.use(
//   (res) => res,
//   async (error) => {
//     if (error.response?.status === 401 && error.response.data?.expired) {

//       // request new token
//       await axios.post("http://localhost:3000/refresh-token", {}, { withCredentials: true });

//       // retry the original request
//       return axios(error.config);
//     }

//     return Promise.reject(error);
//   }
// );

// export default axios

// api/axiosSetup.js
axios.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Retry only once to avoid infinite loop
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh token endpoint
        await axios.post("/refresh-token", {}, { withCredentials: true });

        // Retry the original request
        return axios(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed", refreshError);
        // Optionally redirect to login
        // window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axios