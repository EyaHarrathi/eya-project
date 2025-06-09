import axios from "axios";

const API_URL = "http://localhost:8080/api/friends"; // Your backend URL

const sendInvitation = (senderId, receiverId) => {
  return axios.post(`${API_URL}/invitations/send/${senderId}/${receiverId}`);
};

const acceptInvitation = (senderId, receiverId) => {
  return axios.post(`${API_URL}/invitations/accept/${senderId}/${receiverId}`);
};

const declineInvitation = (senderId, receiverId) => {
  return axios.post(`${API_URL}/invitations/decline/${senderId}/${receiverId}`);
};

const checkFriendship = (userId1, userId2) => {
  return axios.get(`${API_URL}/check-friendship/${userId1}/${userId2}`);
};

export default {
  sendInvitation,
  acceptInvitation,
  declineInvitation,
  checkFriendship,
};
