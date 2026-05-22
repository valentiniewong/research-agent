import { createClient } from "../../utils/supabase/server";
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();
  const supabaseClient = createClient(cookieStore);

  // Fetch todos from Supabase
  const { data: todos } = await supabaseClient.from("todos").select();

  return (
    <main className="p-8 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-slate-800 tracking-tight">Supabase SSR Todos</h1>
      <ul className="divide-y divide-slate-100 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
        {todos && todos.length > 0 ? (
          todos.map((todo: any) => (
            <li key={todo.id} className="py-3 font-semibold text-slate-700 flex items-center justify-between">
              <span>{todo.name}</span>
            </li>
          ))
        ) : (
          <li className="py-3 text-slate-400 text-sm">
            No todos found. If you see this, Supabase SSR is configured correctly but the "todos" table is empty or uninitialized.
          </li>
        )}
      </ul>
    </main>
  );
}
