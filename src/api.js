import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://localhost:7041/api/WeatherForecast', // Replace with your API URL
});

export default apiClient;