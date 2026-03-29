import { useEffect, useState } from "react";
import api from "../../api/axios";

interface Event {
  id: number;
  title: string;
  description: string;
  event_date: string;
  location: string;
}

const MemberEventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);

  const fetchEvents = async () => {
    const res = await api.get("/events");
    setEvents(res.data);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const rsvp = async (eventId: number, status: "YES" | "NO") => {
    await api.post(`/events/${eventId}/rsvp`, { status });
    alert("RSVP saved");
  };

  return (
    <div>
      <h2>Upcoming Events</h2>

      <ul>
        {events.map((e) => (
          <li key={e.id}>
            <b>{e.title}</b><br />
            {e.description}<br />
            {e.event_date} — {e.location}<br />
            <button onClick={() => rsvp(e.id, "YES")}>YES</button>{" "}
            <button onClick={() => rsvp(e.id, "NO")}>NO</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MemberEventsPage;
