import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Layout,
  Menu,
  Card,
  Row,
  Col,
  Modal,
  Button,
  Spin,
  Typography,
  Avatar,
} from "antd";
import avatarImg from "../assets/preweding_shoot_photos_Photo_P1393773.jpg";

import {
  PictureOutlined,
  VideoCameraOutlined,
  DownloadOutlined,
} from "@ant-design/icons";

import API from "../api";

const { Header, Content } = Layout;
const { Title } = Typography;

function Gallery() {

  const navigate = useNavigate();

  const [files, setFiles] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [nextToken, setNextToken] =
    useState(null);

  const [hasMore, setHasMore] =
    useState(true);

  const [previewImage, setPreviewImage] =
    useState("");

  const [openPreview, setOpenPreview] =
    useState(false);

  const [selectedType, setSelectedType] =
    useState("images");

  useEffect(() => {
    setFiles([]);
    setNextToken(null);
    setHasMore(true);
    fetchFiles();
  }, [selectedType]);

  const fetchFiles = async (
    token = null
  ) => {
    try {
      setLoading(true);

      const endpoint = selectedType === "videos" ? "/videos" : "/files";
      let url = `${endpoint}?limit=8`;

      if (token) {
        url += `&continuationToken=${encodeURIComponent(token)}`;
      }

      const storedToken = localStorage.getItem("token");
      console.log("fetchFiles -> url:", url, "token present:", !!storedToken);

      const res = await API.get(url);
      console.log("fetchFiles -> response:", res);

      const newFiles = res.data.files || res.data.videos || [];

      setFiles((prev) => [...prev, ...newFiles]);

      setNextToken(res.data.nextToken);

      setHasMore(res.data.hasMore);
    } catch (error) {
      console.error("fetchFiles error:", error.response?.status, error.response?.data || error.message, error);
    } finally {
      setLoading(false);
    }
  };

  const imageFiles =
    files.filter((file) =>
      file.name.match(
        /\.(jpg|jpeg|png|webp)$/i
      )
    );

  const videoFiles =
    files.filter((file) =>
      file.name.match(
        /\.(mp4|mov|webm)$/i
      )
    );

  const currentFiles =
    selectedType === "images"
      ? imageFiles
      : videoFiles;

  const handleLogout = () => {

    localStorage.clear();

    navigate("/login", {
      replace: true,
    });

    window.location.reload();
  };

  const downloadFile = async (
    key
  ) => {

    const res =
      await API.get(
        `/download/${encodeURIComponent(
          key
        )}`
      );

    window.open(
      res.data.url,
      "_blank"
    );
  };

  return (
    <Layout
      style={{
        minHeight: "100vh",
      }}
    >

      {/* HEADER */}

      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#001529",
          padding: "0 20px",
        }}
      >

        {/* LOGO */}

        {/* LOGO (avatar image) */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Avatar src={avatarImg} size={48} />
          <span style={{ color: "white", fontSize: 16, fontWeight: 500 }}>Babli_Jitendra</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          {/* <Avatar src={avatarImg} size={48} /> */}
          {/* Babli_Jitendra */}
        </div>

        {/* MENU */}

        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedType]}
          onClick={(e) =>
            setSelectedType(e.key)
          }
          style={{
            flex: 1,
            marginLeft: 40,
          }}
          items={[
            {
              key: "images",
              icon: <PictureOutlined />,
              label: "Images",
              style: selectedType === "images" ? { backgroundColor: "#f03e3e" } : {},
            },
            {
              key: "videos",
              icon: <VideoCameraOutlined />,
              label: "Videos",
              style: selectedType === "videos" ? { backgroundColor: "#f03e3e" } : {},
            },
          ]}
        />

        {/* LOGOUT */}

        <Button
          danger
          onClick={handleLogout}
        >
          Logout
        </Button>

      </Header>

      {/* CONTENT */}

      <Content
        style={{
          padding: 24,
        }}
      >

        <Row gutter={[24, 24]}>

          {currentFiles.map(
            (file, index) => {

              const isImage =
                selectedType ===
                "images";

              return (
                <Col
                  xs={24}
                  sm={12}
                  md={8}
                  lg={6}
                  key={index}
                >

                  <Card
                    hoverable
                    cover={
                      isImage ? (

                        <img
                          loading="lazy"
                          src={file.previewUrl}   // FAST IMAGE
                          style={{
                            height: 220,
                            objectFit: "cover",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setPreviewImage(file.previewUrl); // FULL IMAGE
                            setOpenPreview(true);
                          }}
                        />

                      ) : (

                        <video
                          controls
                          preload="metadata"
                          style={{
                            width: "100%",
                            height: 220,
                            objectFit:
                              "cover",
                          }}
                        >
                          <source
                            src={file.url}
                            type="video/mp4"
                          />
                        </video>
                      )
                    }
                  >

                    <Card.Meta
                      title={
                        file.name
                      }
                    />

                    <Button
                      type="primary"
                      icon={
                        <DownloadOutlined />
                      }
                      style={{
                        width: "100%",
                        marginTop: 12,
                        backgroundColor: "#f03e3e",
                      }}
                      onClick={() =>
                        downloadFile(
                          file.downloadKey
                        )
                      }
                    >
                      Download
                    </Button>

                  </Card>
                </Col>
              );
            }
          )}
        </Row>

        {/* LOAD MORE */}

        <div
          style={{
            textAlign: "center",
            marginTop: 40,
          }}
        >

          {loading && (
            <Spin size="large" />
          )}

          {!loading &&
            hasMore && (
              <Button
                type="primary"
                size="large"
                onClick={() =>
                  fetchFiles(
                    nextToken
                  )
                }
              >
                Load More
              </Button>
            )}

          {!hasMore && (
            <p>
              No more files
            </p>
          )}

        </div>

      </Content>

      {/* IMAGE MODAL */}

      <Modal
        open={openPreview}
        footer={null}
        onCancel={() =>
          setOpenPreview(false)
        }
        width={900}
      >
        <img
          src={previewImage}
          alt=""
          style={{
            width: "100%",
          }}
        />
      </Modal>

    </Layout>
  );
}

export default Gallery;