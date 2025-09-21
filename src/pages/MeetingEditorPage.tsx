import { useParams, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { useDemo } from "../lib/demo";
import { repo } from "../lib/repo";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

type Row = { id: string; name: string; minutes: number };

export default function MeetingEditorPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { state } = useDemo();
    const group = useMemo(
        () => state.groups.find((g) => g.id === id),
        [state, id]
    );
    const [rows, setRows] = useState<Row[]>(() =>
        group
            ? group.members.map((m) => ({
                  id: m.id,
                  name: m.displayName,
                  minutes: 0,
              }))
            : []
    );

    const setMinutes = (rid: string, minutes: number) => {
        setRows((r) =>
            r.map((x) =>
                x.id === rid
                    ? { ...x, minutes: Math.max(0, Math.round(minutes)) }
                    : x
            )
        );
    };

    const applyAll = (delta: number) => {
        setRows((r) =>
            r.map((x) => ({ ...x, minutes: Math.max(0, x.minutes + delta) }))
        );
    };

    const submit = () => {
        if (!group) return;
        const map: Record<string, number> = {};
        rows.forEach((r) => (map[r.id] = r.minutes));
        repo.createMeeting(group.id, new Date().toISOString(), map);
        navigate(`/app/groups/${group.id}`);
    };

    return (
        <section className="page space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Meeting editor</h1>
                <div className="flex gap-2">
                    <Button onClick={() => applyAll(1)}>+1 all</Button>
                    <Button onClick={() => applyAll(5)}>+5 all</Button>
                </div>
            </div>

            <div className="glass rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-white/5">
                        <tr>
                            <th className="text-left p-3 font-medium">
                                Member
                            </th>
                            <th className="text-left p-3 font-medium">
                                Minutes late
                            </th>
                            <th className="p-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r) => (
                            <tr key={r.id} className="border-t border-white/10">
                                <td className="p-3">{r.name}</td>
                                <td className="p-3">
                                    <Input
                                        type="number"
                                        min={0}
                                        className="w-28"
                                        value={r.minutes}
                                        onChange={(e) =>
                                            setMinutes(
                                                r.id,
                                                parseInt(e.target.value || "0")
                                            )
                                        }
                                    />
                                </td>
                                <td className="p-3">
                                    <div className="flex gap-1">
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                setMinutes(r.id, r.minutes + 1)
                                            }
                                        >
                                            +1
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                setMinutes(r.id, r.minutes + 5)
                                            }
                                        >
                                            +5
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end">
                <Button variant="solid" onClick={submit}>
                    Save meeting
                </Button>
            </div>
        </section>
    );
}
