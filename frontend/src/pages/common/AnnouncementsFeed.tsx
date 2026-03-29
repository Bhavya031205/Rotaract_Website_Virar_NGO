import { useEffect, useState } from "react";
import api from "../../api/axios";

interface Announcement {
  id: number;
  title: string;
  message: string;
  created_by_name: string;
  created_at: string;
}

const AnnouncementsFeed = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    api.get("/announcements").then((res) => setAnnouncements(res.data));
  }, []);

  return (
    <div>
      <h2>Announcements</h2>

      {announcements.map((a) => (
        <div key={a.id} style={{ marginBottom: "20px" }}>
          <h3>{a.title}</h3>
          <p>{a.message}</p>
          <small>
            By {a.created_by_name} |{" "}
            {new Date(a.created_at).toLocaleString()}
          </small>
        </div>
      ))}
    </div>
  );
};

export default AnnouncementsFeed;
