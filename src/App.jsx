import { useState } from "react";
import { Modal } from "bootstrap";
import axios from "axios";
import { setCookie, getCookie } from "./utility";

const API_PATH = import.meta.env.VITE_API_PATH;
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE });
const COOKIE_NAME = import.meta.env.VITE_COOKIE_NAME;

function App() {
  const [formData, setFormData] = useState({
    username: "nomorecomputer@gmail.com",
    password: "nomorecomputer",
  });
  const [isAuth, setIsAuth] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState(null);

  const signIn = () => {
    api
      .post("/admin/signin", formData)
      .then((response) => {
        const { token, expired } = response.data;
        setCookie(COOKIE_NAME, token, expired);
        api.defaults.headers.common["Authorization"] = token;
        setIsAuth(true);
        getProducts();
      })
      .catch((error) => {
        setIsAuth(false);
        console.log(error.response.data.message);
      });
  };

  const handleInputChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const checkLogin = async () => {
    try {
      api.defaults.headers.common["Authorization"] = getCookie(COOKIE_NAME);
      const response = await api.post("/api/user/check");
      console.log(response.data.success);
      setIsChecked(response.data.success);
    } catch (error) {
      console.log(
        `登入逾期、失效，請重新登入！ ${error.response.data.message}`
      );
      setIsChecked(false);
      // console.error(error.response.message);
    }
  };

  const getProducts = async () => {
    try {
      const response = await api.get(`/api${API_PATH}/admin/products/all`);
      setProducts(Object.values(response.data.products));
    } catch (error) {
      console.error(error.response.message);
    }
  };

  return (
    <>
      {isAuth ? (
        <div className="container">
          <button
            className={`btn btn-lg ${
              isChecked ? "btn-success" : "btn-danger"
            } m-5`}
            type="button"
            onClick={checkLogin}
          >
            確認是否登入
          </button>
          <div className="row mt-5">
            <div className="col-md-6">
              <h2>產品列表</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th>產品名稱</th>
                    <th>原價</th>
                    <th>售價</th>
                    <th>是否啟用</th>
                    <th>查看細節</th>
                  </tr>
                </thead>
                <tbody>
                  {products && products.length > 0 ? (
                    products.map((item) => (
                      <tr key={item.id}>
                        <td>{item.title}</td>
                        <td>{item.origin_price}</td>
                        <td>{item.price}</td>
                        <td>{item.is_enabled ? "啟用" : "未啟用"}</td>
                        <td>
                          <button
                            className="btn btn-primary"
                            onClick={() => setTempProduct(item)}
                          >
                            查看細節
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">尚無產品資料</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="col-md-6">
              <h2>單一產品細節</h2>
              {tempProduct ? (
                <div className="card mb-3">
                  <img
                    src={tempProduct.imageUrl}
                    className="card-img-top primary-image"
                    alt="主圖"
                  />
                  <div className="card-body">
                    <h5 className="card-title">
                      {tempProduct.title}
                      <span className="badge bg-primary ms-2">
                        {tempProduct.category}
                      </span>
                    </h5>
                    <p className="card-text">
                      商品描述：{tempProduct.description}
                    </p>
                    <p className="card-text">商品內容：{tempProduct.content}</p>
                    <div className="d-flex">
                      <p className="card-text text-secondary">
                        <del>{tempProduct.origin_price}</del>
                      </p>
                      元 / {tempProduct.price} 元
                    </div>
                    <h5 className="mt-3">更多圖片：</h5>
                    <div className="d-flex flex-wrap">
                      {tempProduct.imagesUrl?.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          className="images"
                          alt="副圖"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-secondary">請選擇一個商品查看</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="container login">
          <div className="row justify-content-center">
            <h1 className="h3 mb-3 font-weight-normal">請先登入</h1>
            <div className="col-8">
              <form id="form" className="form-signin">
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    name="username"
                    placeholder="name@example.com"
                    value={formData.username}
                    onChange={(e) => handleInputChange(e)}
                    required
                    autoFocus
                  />
                  <label htmlFor="username">Email address</label>
                </div>
                <div className="form-floating">
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="password">Password</label>
                </div>
                <button
                  className="btn btn-lg btn-primary w-100 mt-3"
                  type="button"
                  onClick={signIn}
                >
                  登入
                </button>
              </form>
            </div>
          </div>
          <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
        </div>
      )}
    </>
  );
}

export default App;
