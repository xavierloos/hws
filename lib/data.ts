import axios from "axios";

export const getItems = async (type: string) => {
  try {
    const res = await axios
      .get(`/api/${type}`)
      .then((res) => {
        return res.data;
      })
      .catch((e) => {});
    console.log(res);
    return res;
  } catch {
    return null;
  }
};
