import { Link } from 'react-router-dom'

interface Props {
  id: string
  name: string
  icon: string
  color: [string, string]
  count: number
}

export default function CategoryCard({ id, name, icon, color, count }: Props) {
  return (
    <Link
      to={`/category/${id}`}
      className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 aspect-[4/3] flex flex-col justify-end p-5 group"
      style={{ background: `linear-gradient(145deg, ${color[0]}, ${color[1]})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      <div className="absolute top-4 right-4 text-4xl opacity-80 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="relative">
        <div className="text-white font-bold text-lg leading-tight">{name}</div>
        <div className="text-white/70 text-sm mt-0.5">
          {count === 0 ? 'Žádné recepty' : `${count} ${count === 1 ? 'recept' : count <= 4 ? 'recepty' : 'receptů'}`}
        </div>
      </div>
    </Link>
  )
}
