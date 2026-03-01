import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
    LayoutDashboard, Egg, Package, ChefHat, DollarSign, Zap, Receipt, ShoppingCart,
    BarChart3, Plus, Trash2, Edit2, Save, X, ChevronRight, AlertCircle, Menu,
    TrendingUp, TrendingDown, ArrowUpRight, Calculator, Info, ChevronDown,
    Calendar, Search, Filter, CheckCircle2, Clock, Flame, Percent, LogOut, Settings,
    ArrowLeft, Minus, Box, User, Layers, Wheat, ShoppingBag
} from 'lucide-react';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- UTILS ---
function cn(...inputs) { return twMerge(clsx(inputs)); }
const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
const formatDate = (dateStr) => { if (!dateStr) return ''; const date = new Date(dateStr); return date.toLocaleDateString('pt-BR'); };

// --- SUPABASE CLIENT ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- UI COMPONENTS ---
const Card = ({ children, className, title, subtitle, action }) => (
    <div className={cn("bg-white rounded-2xl shadow-lg p-6 border border-pink-100 transition-all hover:shadow-xl", className)}>
        {(title || action) && (
            <div className="flex justify-between items-center mb-6">
                <div>
                    {title && <h3 className="text-xl font-bold text-dark">{title}</h3>}
                    {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                </div>
                {action}
            </div>
        )}
        {children}
    </div>
);

const Button = ({ children, variant = 'primary', size = 'md', className, ...props }) => {
    const variants = {
        primary: "bg-primary text-white hover:bg-pink-600 shadow-pink-200",
        secondary: "bg-white text-primary border-2 border-primary hover:bg-pink-50",
        danger: "bg-red-500 text-white hover:bg-red-600 shadow-red-100",
        ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
        accent: "bg-accent text-dark hover:bg-yellow-500 shadow-yellow-100",
    };
    const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-5 py-2.5", lg: "px-8 py-3.5 text-lg" };
    return (
        <button className={cn("rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md disabled:opacity-50", variants[variant], sizes[size], className)} {...props}>
            {children}
        </button>
    );
};

const Input = ({ label, error, className, ...props }) => (
    <div className={cn("flex flex-col gap-1.5", className)}>
        {label && <label className="text-sm font-medium text-gray-700 ml-1">{label}</label>}
        <input className={cn("px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-primary focus:ring-4 focus:ring-pink-100 outline-none transition-all", error && "border-red-500")} {...props} />
    </div>
);

const Select = ({ label, options, error, className, ...props }) => (
    <div className={cn("flex flex-col gap-1.5", className)}>
        {label && <label className="text-sm font-medium text-gray-700 ml-1">{label}</label>}
        <select className={cn("px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-primary outline-none bg-white")} {...props}>
            <option value="">Selecione...</option>
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);

const Badge = ({ children, variant = 'primary' }) => {
    const variants = {
        primary: "bg-pink-100 text-pink-700",
        success: "bg-green-100 text-green-700",
        warning: "bg-yellow-100 text-yellow-700",
        accent: "bg-amber-100 text-amber-700",
        info: "bg-blue-100 text-blue-700",
    };
    return <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider", variants[variant])}>{children}</span>;
};

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-dark/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-dark">{title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X size={24} /></button>
                </div>
                {children}
            </div>
        </div>
    );
};

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
    <button onClick={onClick} className={cn("w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group", active ? "bg-primary text-white shadow-lg translate-x-1" : "text-gray-500 hover:bg-pink-50 hover:text-primary")}>
        <Icon size={22} />
        <span className="font-bold tracking-tight">{label}</span>
    </button>
);

// --- MAIN DASHBOARD COMPONENT ---
export default function DashboardDoceEncanto({ session }) {
    const userId = session?.user?.id;
    const userEmail = session?.user?.email;
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isLoading, setIsLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTopping, setSelectedTopping] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [ingredientes, setIngredientes] = useState([]);
    const [embalagens, setEmbalagens] = useState([]);
    const [receitas, setReceitas] = useState([]);
    const [custosFixos, setCustosFixos] = useState([]);
    const [custosVariaveis, setCustosVariaveis] = useState([]);
    const [impostos, setImpostos] = useState([]);
    const [vendas, setVendas] = useState([]);
    const [ingredientesBase, setIngredientesBase] = useState([]);

    const [editingItem, setEditingItem] = useState(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const results = await Promise.all([
                supabase.from('ingredientes').select('*').order('nome'),
                supabase.from('embalagens').select('*').order('nome'),
                supabase.from('receitas').select('*, receita_ingredientes(*), receita_embalagens(*)').order('nome'),
                supabase.from('custos_fixos').select('*').order('mes_referencia', { ascending: false }),
                supabase.from('custos_variaveis').select('*'),
                supabase.from('impostos_taxas').select('*'),
                supabase.from('vendas').select('*, receitas(nome, categoria)').order('data', { ascending: false }),
                supabase.from('ingredientes_base').select('*')
            ]);

            results.forEach((r, i) => { if (r.error) console.error(`Error in query ${i}: `, r.error); });

            setIngredientes(results[0].data || []);
            setEmbalagens(results[1].data || []);

            // Merge localStorage data for recipes (bridge while SQL is not applied)
            const localConfigs = JSON.parse(localStorage.getItem('recipe_configs') || '{}');
            const mergedReceitas = (results[2].data || []).map(r => ({
                ...r,
                ...(localConfigs[r.id] || {})
            }));
            setReceitas(mergedReceitas);

            setCustosFixos(results[3].data || []);
            setCustosVariaveis(results[4].data || []);
            setImpostos(results[5].data || []);
            setVendas((results[6].data || []).map(v => ({ ...v, receita_nome: v.receitas?.nome, receita_categoria: v.receitas?.categoria })));
            setIngredientesBase(results[7].data || []);
        } catch (e) {
            console.error("Fetch Data Error:", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const stats = useMemo(() => {
        const faturamento = vendas.reduce((acc, v) => acc + (Number(v.preco_venda) * v.quantidade), 0);
        const custosTotal = vendas.reduce((acc, v) => acc + (Number(v.custo_total) * v.quantidade), 0);
        const lucroTotal = faturamento - custosTotal;
        return {
            faturamento, custos: custosTotal, lucro: lucroTotal,
            margem: faturamento > 0 ? (lucroTotal / faturamento) * 100 : 0,
            countVendas: vendas.reduce((acc, v) => acc + v.quantidade, 0),
            estoqueBaixo: ingredientes.filter(i => Number(i.quantidade_estoque) <= (Number(i.estoque_minimo) || 1))
        };
    }, [vendas, ingredientes]);

    const salesDayData = useMemo(() => {
        const map = {};
        vendas.forEach(v => { const d = v.data; map[d] = (map[d] || 0) + (Number(v.preco_venda) * v.quantidade); });
        return Object.entries(map).sort().slice(-7).map(([data, valor]) => ({ data: formatDate(data), valor }));
    }, [vendas]);

    const deleteItem = async (table, id) => { if (window.confirm('Excluir item?')) { await supabase.from(table).delete().eq('id', id); fetchData(); } };

    const handleSeedData = async () => {
        if (!window.confirm('Deseja carregar os ingredientes e a massa base padrão? Isso facilitará seu início.')) return;
        setIsLoading(true);
        try {
            const defaults = [
                { nome: 'Farinha de Trigo', unidade: 'unid.', preco_unitario: 5.50, quantidade_estoque: 10, user_id: userId },
                { nome: 'Açúcar Refinado', unidade: 'unid.', preco_unitario: 4.20, quantidade_estoque: 10, user_id: userId },
                { nome: 'Ovos', unidade: 'Bandeja', preco_unitario: 24.00, quantidade_estoque: 2, user_id: userId },
                { nome: 'Leite Integral', unidade: 'unid.', preco_unitario: 4.80, quantidade_estoque: 12, user_id: userId },
                { nome: 'Manteiga', unidade: 'unid.', preco_unitario: 25.00, quantidade_estoque: 2, user_id: userId },
                { nome: 'Fermento em Pó', unidade: 'unid.', preco_unitario: 25.00, quantidade_estoque: 1, user_id: userId }
            ];

            const { data: createdIngs } = await supabase.from('ingredientes').insert(defaults).select();

            if (createdIngs) {
                const baseMap = {
                    'Farinha de Trigo': 0.300,
                    'Açúcar Refinado': 0.200,
                    'Ovos': 3,
                    'Leite Integral': 0.200,
                    'Manteiga': 0.100,
                    'Fermento em Pó': 0.015
                };

                const baseInserts = createdIngs
                    .filter(i => baseMap[i.nome])
                    .map(i => ({ ingrediente_id: i.id, quantidade: baseMap[i.nome], user_id: userId }));

                await supabase.from('ingredientes_base').insert(baseInserts);
            }
            fetchData();
            alert('Dados padrão carregados com sucesso!');
        } catch (e) {
            console.error(e);
            alert('Erro ao carregar dados padrão.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    // --- SECTIONS ---

    const renderDashboard = () => (
        <div className="space-y-12 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <Card className="bg-pink-600 text-white border-none shadow-pink-200">
                    <p className="opacity-70 text-xs font-black uppercase">Faturamento</p>
                    <h3 className="text-3xl font-black">{formatCurrency(stats.faturamento)}</h3>
                </Card>
                <Card className="bg-emerald-500 text-white border-none shadow-green-200">
                    <p className="opacity-70 text-xs font-black uppercase">Lucro Líquido</p>
                    <h3 className="text-3xl font-black">{formatCurrency(stats.lucro)}</h3>
                </Card>
                <Card className="bg-amber-400 text-white border-none shadow-orange-200">
                    <p className="opacity-70 text-xs font-black uppercase">Custos</p>
                    <h3 className="text-3xl font-black">{formatCurrency(stats.custos)}</h3>
                </Card>
                <Card className="bg-indigo-500 text-white border-none shadow-indigo-200">
                    <p className="opacity-70 text-xs font-black uppercase">Vendas</p>
                    <h3 className="text-3xl font-black">{stats.countVendas} un</h3>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Desempenho Semanal">
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesDayData}><XAxis dataKey="data" hide /><Tooltip /><Bar dataKey="valor" fill="#ec4899" radius={[10, 10, 0, 0]} /></BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card title="Alertas de Estoque">
                    <div className="space-y-3">
                        {stats.estoqueBaixo.map(i => (
                            <div key={i.id} className="flex justify-between items-center p-3 bg-red-50 border border-red-100 rounded-xl">
                                <span className="font-bold">{i.nome}</span>
                                <Badge variant="warning">{i.quantidade_estoque} {i.unidade}</Badge>
                            </div>
                        ))}
                        {stats.estoqueBaixo.length === 0 && <p className="text-gray-400 text-center py-10 font-medium">Tudo certo com o estoque!</p>}
                    </div>
                </Card>
            </div>
        </div>
    );

    const renderIngredientes = () => (
        <div className="space-y-10">
            <div className="flex justify-between items-center"><h2 className="text-3xl font-black text-dark">Ingredientes</h2><Button onClick={() => { setEditingItem(null); setIsModalOpen(true); }}><Plus /> Novo</Button></div>
            <Card>
                <table className="w-full text-left">
                    <thead className="text-xs uppercase font-black text-gray-400 border-b"><tr><th className="py-4 px-4">Item</th><th className="py-4">Unit.</th><th className="py-4 text-right">Preço</th><th className="py-4 text-center">Ações</th></tr></thead>
                    <tbody className="divide-y divide-gray-50">{ingredientes.map(i => (<tr key={i.id}>
                        <td className="py-4 px-4 font-bold">{i.nome}</td><td><Badge variant="info">{i.unidade}</Badge></td><td className="py-4 text-right font-black text-primary">{formatCurrency(i.preco_unitario)}</td>
                        <td className="py-4 text-center"><button onClick={() => { setEditingItem(i); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-primary"><Edit2 size={16} /></button><button onClick={() => deleteItem('ingredientes', i.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button></td>
                    </tr>))}</tbody>
                </table>
            </Card>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Ingrediente">
                <form className="space-y-4" onSubmit={async e => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const data = {
                        nome: formData.get('nome'),
                        unidade: formData.get('unidade'),
                        preco_unitario: Number(formData.get('preco_unitario')),
                        quantidade_estoque: Number(formData.get('quantidade_estoque') || 0)
                    };

                    let res;
                    if (editingItem) res = await supabase.from('ingredientes').update(data).eq('id', editingItem.id);
                    else res = await supabase.from('ingredientes').insert([data]);

                    if (res.error) {
                        alert(`Erro ao salvar: ${res.error.message} `);
                    } else {
                        setIsModalOpen(false);
                        fetchData();
                    }
                }}>
                    <Input label="Nome" name="nome" defaultValue={editingItem?.nome} required />
                    <div className="grid grid-cols-2 gap-4">
                        <Select label="Unidade" name="unidade" defaultValue={editingItem?.unidade} options={[
                            { value: 'unid.', label: 'Unidade' },
                            { value: 'Bandeja', label: 'Bandeja' },
                            { value: 'Pacote', label: 'Pacote' },
                            { value: 'Caixa', label: 'Caixa' },
                            { value: 'kg', label: 'kg' },
                            { value: 'litros', label: 'litros' },
                            { value: 'gramas', label: 'gramas' },
                            { value: 'ml', label: 'ml' }
                        ]} required />
                        <Input label="Preço Unitário" name="preco_unitario" type="number" step="0.01" defaultValue={editingItem?.preco_unitario} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Estoque Atual" name="quantidade_estoque" type="number" step="0.01" defaultValue={editingItem?.quantidade_estoque} />
                        <Input label="Estoque Mínimo (Alerta)" name="estoque_minimo" type="number" step="0.01" defaultValue={editingItem?.estoque_minimo} />
                    </div>
                    <Button className="w-full h-12">Salvar</Button>
                </form>
            </Modal>
        </div>
    );

    const renderEmbalagens = () => (
        <div className="space-y-10">
            <div className="flex justify-between items-center"><h2 className="text-3xl font-black text-dark">Embalagens</h2><Button onClick={() => { setEditingItem(null); setIsModalOpen(true); }}><Plus /> Nova</Button></div>
            <Card>
                <table className="w-full text-left">
                    <thead className="text-xs uppercase font-black text-gray-400 border-b"><tr><th className="py-4 px-4">Nome</th><th className="py-4">Tipo</th><th className="py-4 text-right">Custo</th><th className="py-4 text-center">Ações</th></tr></thead>
                    <tbody className="divide-y divide-gray-50">{embalagens.map(i => (<tr key={i.id}>
                        <td className="py-4 px-4 font-bold">{i.nome}</td><td><Badge variant="primary">{i.tipo}</Badge></td><td className="py-4 text-right font-black text-primary">{formatCurrency(i.custo_unitario)}</td>
                        <td className="py-4 text-center"><button onClick={() => { setEditingItem(i); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-primary"><Edit2 size={16} /></button><button onClick={() => deleteItem('embalagens', i.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button></td>
                    </tr>))}</tbody>
                </table>
            </Card>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Embalagem">
                <form className="space-y-4" onSubmit={async e => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const data = {
                        nome: formData.get('nome'),
                        custo_unitario: Number(formData.get('custo_unitario')),
                        tipo: formData.get('tipo')
                    };
                    let res;
                    if (editingItem) res = await supabase.from('embalagens').update(data).eq('id', editingItem.id);
                    else res = await supabase.from('embalagens').insert([data]);

                    if (res.error) {
                        alert(`Erro ao salvar: ${res.error.message} `);
                    } else {
                        setIsModalOpen(false);
                        fetchData();
                    }
                }}>
                    <Input label="Nome" name="nome" defaultValue={editingItem?.nome} required />
                    <Select label="Tipo" name="tipo" defaultValue={editingItem?.tipo || 'Caixa'} options={[
                        { value: 'Caixa', label: 'Caixa' },
                        { value: 'Saco', label: 'Saco' },
                        { value: 'Fita', label: 'Fita' },
                        { value: 'Tag', label: 'Tag' },
                        { value: 'Laço', label: 'Laço' },
                        { value: 'Outro', label: 'Outro' }
                    ]} required />
                    <Input label="Custo Unitário" name="custo_unitario" type="number" step="0.01" defaultValue={editingItem?.custo_unitario} required />
                    <Button className="w-full h-12">Salvar</Button>
                </form>
            </Modal>
        </div>
    );

    const renderCustos = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card title="Energia e Gás">
                    <div className="space-y-4">
                        {custosVariaveis.map(cv => (
                            <div key={cv.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                                <div><p className="text-xs font-black uppercase text-gray-400">{cv.tipo}</p><p className="font-black text-xl">{formatCurrency(cv.custo_por_hora)} /h</p></div>
                                <Button variant="ghost" onClick={() => { setEditingItem({ ...cv, table: 'custos_variaveis' }); setIsModalOpen(true); }}><Edit2 /></Button>
                            </div>
                        ))}
                    </div>
                </Card>
                <Card title="Impostos Ativos">
                    <div className="space-y-3">
                        {impostos.map(i => (
                            <div key={i.id} className="flex justify-between items-center">
                                <span className="font-bold">{i.nome}</span>
                                <Badge variant={i.ativo ? "success" : "primary"}>{i.percentual}%</Badge>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
            <Card title="Custo Fixo Rateado">
                {custosFixos[0] && (
                    <div className="p-6 bg-primary text-white rounded-3xl text-center">
                        <p className="text-xs font-black uppercase opacity-70 mb-2">Impacto por Unidade Produzida</p>
                        <h3 className="text-5xl font-black">{formatCurrency(15.50)}</h3>
                        <p className="text-xs mt-4 opacity-50">* Baseado na média dos últimos meses</p>
                    </div>
                )}
            </Card>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Atualizar Custos">
                <form className="space-y-4" onSubmit={async e => { e.preventDefault(); const v = Object.fromEntries(new FormData(e.target)).v; await supabase.from('custos_variaveis').update({ custo_por_hora: v }).eq('id', editingItem.id); setIsModalOpen(false); fetchData(); }}>
                    <Input label="Valor" name="v" type="number" step="0.01" defaultValue={editingItem?.custo_por_hora} />
                    <Button className="w-full">Salvar</Button>
                </form>
            </Modal>
        </div>
    );

    const renderVendas = () => (
        <div className="space-y-10">
            <div className="flex justify-between items-center"><h2 className="text-3xl font-black text-dark">Vendas</h2><Button onClick={() => setIsModalOpen(true)}><ShoppingCart /> Lançar Venda</Button></div>
            <Card>
                <table className="w-full text-left">
                    <thead className="text-xs uppercase font-black text-gray-400 border-b"><tr><th className="py-4 px-4">Data</th><th className="py-4">Produto</th><th className="py-4 text-right">Valor</th><th className="py-4 text-right">Lucro</th></tr></thead>
                    <tbody className="divide-y divide-gray-50">{vendas.map(v => (<tr key={v.id}>
                        <td className="py-4 px-4 text-xs font-bold text-gray-500">{formatDate(v.data)}</td><td className="py-4 font-black">{v.receita_nome}</td><td className="py-4 text-right font-black text-primary">{formatCurrency(v.preco_venda)}</td><td className="py-4 text-right font-bold text-green-600">+{formatCurrency(v.lucro)}</td>
                    </tr>))}</tbody>
                </table>
            </Card>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Venda">
                <form className="space-y-4" onSubmit={async e => { e.preventDefault(); const fd = Object.fromEntries(new FormData(e.target)); await supabase.from('vendas').insert([{ receita_id: fd.rid, quantidade: 1, data: fd.d, preco_venda: fd.p, custo_total: 10, lucro: fd.p - 10 }]); setIsModalOpen(false); fetchData(); }}>
                    <Select label="Produto" name="rid" options={receitas.map(r => ({ value: r.id, label: r.nome }))} required />
                    <Input label="Preço Praticado" name="p" type="number" step="0.01" required />
                    <Input label="Data" name="d" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                    <Button className="w-full h-12">Finalizar</Button>
                </form>
            </Modal>
        </div>
    );

    const renderRelatorios = () => (
        <div className="space-y-8 animate-in zoom-in duration-500">
            <h2 className="text-3xl font-black text-dark">Análise de Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center"><p className="text-xs font-black uppercase text-gray-400 mb-2">Ticket Médio</p><p className="text-2xl font-black text-primary">{formatCurrency(stats.faturamento / (vendas.length || 1))}</p></Card>
                <Card className="text-center"><p className="text-xs font-black uppercase text-gray-400 mb-2">Margem Líquida</p><p className="text-2xl font-black text-green-600">{stats.margem.toFixed(1)}%</p></Card>
                <Card className="text-center"><p className="text-xs font-black uppercase text-gray-400 mb-2">Receita Total</p><p className="text-2xl font-black text-dark">{formatCurrency(stats.faturamento)}</p></Card>
            </div>
            <Card title="Composição de Custo Operacional">
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={[{ name: 'Insumos', v: 60 }, { name: 'Embalagem', v: 15 }, { name: 'Fixos', v: 25 }]} dataKey="v" innerRadius={60} outerRadius={100} paddingAngle={5}>
                                <Cell fill="#ec4899" /><Cell fill="#f472b6" /><Cell fill="#fbbf24" />
                            </Pie>
                            <Tooltip /><Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );

    const renderMassaBase = () => (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-dark tracking-tight">Massa Base</h2>
                    <p className="text-sm text-pink-500 font-bold">Ingredientes comuns a todas as receitas</p>
                </div>
                <div className="flex flex-wrap gap-4 w-full md:w-auto">
                    {ingredientes.length === 0 && (
                        <Button onClick={handleSeedData} variant="secondary" className="border-dashed border-2 flex-1 md:flex-initial">
                            🪄 Carregar Padrões
                        </Button>
                    )}
                    <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-sm text-center flex-1 md:flex-initial">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Custo da Massa Base</p>
                        <p className="text-2xl font-black text-primary">
                            {formatCurrency(ingredientesBase.reduce((a, r) => a + (Number(ingredientes.find(i => i.id === r.ingrediente_id)?.preco_unitario || 0) * r.quantidade), 0))}
                        </p>
                    </div>
                </div>
            </div>

            <Card title="Composição da Base" subtitle="Estes itens serão somados automaticamente em todos os novos bolos">
                <div className="mb-8 p-4 bg-pink-50 rounded-2xl flex flex-col md:flex-row gap-4 md:items-end">
                    <div className="flex-1">
                        <Select label="Adicionar Ingrediente" id="base_ing_id" options={ingredientes.map(i => ({ value: i.id, label: i.nome }))} />
                    </div>
                    <div className="w-full md:w-32">
                        <Input label="Quantidade" type="number" id="base_ing_qty" placeholder="0.00" />
                    </div>
                    <Button onClick={async () => {
                        const id = document.getElementById('base_ing_id').value;
                        const qty = document.getElementById('base_ing_qty').value;
                        if (id && qty) {
                            const { error } = await supabase.from('ingredientes_base').insert([{ ingrediente_id: id, quantidade: Number(qty) }]);
                            if (error) alert(`Erro ao adicionar: ${error.message} `);
                            else fetchData();
                        }
                    }} className="w-full md:w-auto h-12">Adicionar</Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-[10px] font-black text-gray-400 uppercase border-b border-gray-100">
                                <th className="pb-4 text-left">Ingrediente</th>
                                <th className="pb-4 text-center">Quantidade</th>
                                <th className="pb-4 text-right">Custo</th>
                                <th className="pb-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {ingredientesBase.map((it, idx) => {
                                const ing = ingredientes.find(i => i.id === it.ingrediente_id);
                                return (
                                    <tr key={idx} className="group">
                                        <td className="py-4 font-bold text-dark">{ing?.nome}</td>
                                        <td className="py-4 text-center text-gray-500 font-medium">{it.quantidade} {ing?.unidade}</td>
                                        <td className="py-4 text-right font-black text-primary">{formatCurrency(Number(ing?.preco_unitario) * it.quantidade)}</td>
                                        <td className="py-4 text-center">
                                            <button onClick={async () => { await supabase.from('ingredientes_base').delete().eq('id', it.id); fetchData(); }} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {ingredientesBase.length === 0 && (
                                <tr><td colSpan="4" className="py-12 text-center text-gray-300 font-bold italic text-sm">Configure os ingredientes comuns aqui</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );

    const renderCoberturas = () => {
        const filtered = receitas.filter(r => r.categoria === 'Cobertura' || r.categoria === 'Recheio');
        const activeTopping = selectedTopping ? receitas.find(r => r.id === selectedTopping) : null;

        return (
            <div className="space-y-10 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-dark tracking-tight">Cálculo de Coberturas</h2>
                        <p className="text-sm text-indigo-500 font-bold">Defina os ingredientes de cada recheio ou cobertura</p>
                    </div>
                    <Button onClick={async () => {
                        const nome = prompt('Nome da Cobertura/Recheio:');
                        if (nome) {
                            const { data, error } = await supabase.from('receitas').insert([{
                                nome,
                                categoria: 'Cobertura',
                                margem_lucro: 100,
                                rendimento: 1,
                                rendimento_fatias: 1,
                                tempo_preparo_minutos: 0,
                                tempo_forno_minutos: 0
                            }]).select();
                            if (error) {
                                console.error(error);
                                alert(`Erro ao criar: ${error.message} `);
                            }
                            else { fetchData(); setSelectedTopping(data[0].id); }
                        }
                    }} className="bg-indigo-600 hover:bg-indigo-700 h-12 shadow-indigo-100">
                        <Plus /> Nova Cobertura
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Lista Lateral */}
                    <div className="lg:col-span-1 space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-3">Suas Coberturas</p>
                        {filtered.map(r => (
                            <button
                                key={r.id}
                                onClick={() => setSelectedTopping(r.id)}
                                className={cn(
                                    "w-full text-left px-4 py-3 rounded-2xl font-bold transition-all",
                                    selectedTopping === r.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-white text-gray-500 hover:bg-indigo-50"
                                )}
                            >
                                {r.nome}
                            </button>
                        ))}
                        {filtered.length === 0 && <p className="text-xs text-gray-400 italic p-4 text-center">Nenhuma cadastrada</p>}
                    </div>

                    {/* Editor Estilo Massa Base */}
                    <div className="lg:col-span-3">
                        {activeTopping ? (
                            <Card title={`Composição: ${activeTopping.nome} `} subtitle="Adicione os ingredientes para calcular o custo unitário">
                                <div className="mb-8 p-4 bg-indigo-50 rounded-2xl flex flex-col md:flex-row gap-4 md:items-end">
                                    <div className="flex-1">
                                        <Select label="Adicionar Ingrediente" id="top_ing_id" options={ingredientes.map(i => ({ value: i.id, label: i.nome }))} />
                                    </div>
                                    <div className="w-full md:w-32">
                                        <Input label="Quantidade" type="number" id="top_ing_qty" placeholder="0.00" />
                                    </div>
                                    <Button onClick={async () => {
                                        const id = document.getElementById('top_ing_id').value;
                                        const qty = document.getElementById('top_ing_qty').value;
                                        if (id && qty) {
                                            const { error } = await supabase.from('receita_ingredientes').insert([{ receita_id: activeTopping.id, ingrediente_id: id, quantidade: Number(qty) }]);
                                            if (error) alert(`Erro ao adicionar: ${error.message} `);
                                            else fetchData();
                                        }
                                    }} className="bg-indigo-600 hover:bg-indigo-700 w-full md:w-auto h-12">Adicionar</Button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-[10px] font-black text-gray-400 uppercase border-b border-gray-100">
                                                <th className="pb-4 text-left">Ingrediente</th>
                                                <th className="pb-4 text-center">Quantidade</th>
                                                <th className="pb-4 text-right">Custo</th>
                                                <th className="pb-4"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {activeTopping.receita_ingredientes?.map((it, idx) => {
                                                const ing = ingredientes.find(i => i.id === it.ingrediente_id);
                                                return (
                                                    <tr key={idx} className="group">
                                                        <td className="py-4 font-bold text-dark">{ing?.nome}</td>
                                                        <td className="py-4 text-center text-gray-500 font-medium">{it.quantidade} {ing?.unidade}</td>
                                                        <td className="py-4 text-right font-black text-indigo-600">{formatCurrency(Number(ing?.preco_unitario) * it.quantidade)}</td>
                                                        <td className="py-4 text-center">
                                                            <button onClick={async () => { await supabase.from('receita_ingredientes').delete().eq('id', it.id); fetchData(); }} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-indigo-50/50">
                                                <td colSpan="2" className="py-4 px-4 font-black text-indigo-900 uppercase text-xs">Custo Total da Cobertura</td>
                                                <td className="py-4 text-right font-black text-xl text-indigo-600">
                                                    {formatCurrency(activeTopping.receita_ingredientes?.reduce((a, it) => a + (Number(ingredientes.find(i => i.id === it.ingrediente_id)?.preco_unitario || 0) * it.quantidade), 0))}
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </Card>
                        ) : (
                            <div className="bg-white p-20 rounded-[40px] text-center border-2 border-dashed border-indigo-100">
                                <Calculator size={48} className="mx-auto text-indigo-200 mb-4" />
                                <h3 className="text-xl font-bold text-dark mb-2">Selecione ou crie uma cobertura</h3>
                                <p className="text-gray-400 max-w-xs mx-auto">Escolha um item na lista ao lado para ver e editar sua composição.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderEstoque = () => {
        return (
            <div className="space-y-10 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-dark tracking-tight">Gestão de Estoque</h2>
                        <p className="text-sm text-primary font-bold">Controle visual de insumos e matérias-primas</p>
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar insumo..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-100 outline-none focus:border-primary transition-all"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {ingredientes.filter(i => i.nome.toLowerCase().includes(searchQuery.toLowerCase())).map(ing => {
                        const estoque = Number(ing.quantidade_estoque || 0);
                        const minimo = Number(ing.estoque_minimo || 0);
                        const percent = minimo > 0 ? (estoque / minimo) * 100 : 100;

                        let colorClass = "bg-green-500";
                        let textClass = "text-green-600";
                        let bgClass = "bg-green-50";

                        if (estoque <= 0) {
                            colorClass = "bg-red-500";
                            textClass = "text-red-600";
                            bgClass = "bg-red-50";
                        } else if (estoque <= minimo) {
                            colorClass = "bg-orange-500";
                            textClass = "text-orange-600";
                            bgClass = "bg-orange-50";
                        }

                        return (
                            <Card key={ing.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={cn("p-3 rounded-2xl", bgClass, textClass)}>
                                        <Box size={24} />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Qtd Atual</p>
                                        <p className={cn("text-xl font-black", textClass)}>{estoque} <span className="text-[10px] uppercase font-bold opacity-70">{ing.unidade}</span></p>
                                    </div>
                                </div>

                                <h4 className="text-lg font-black text-dark mb-1 truncate">{ing.nome}</h4>
                                <p className="text-xs text-gray-400 font-bold mb-4 italic">Custo: {formatCurrency(ing.preco_unitario)}/{ing.unidade}</p>

                                <div className="space-y-4">
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full transition-all duration-500", colorClass)}
                                            style={{ width: `${Math.min(percent, 100)}%` }}
                                        />
                                    </div>

                                    <div className="flex justify-between items-center bg-gray-50 p-2 rounded-xl">
                                        <button
                                            onClick={async () => {
                                                const { error } = await supabase.from('ingredientes').update({ quantidade_estoque: Math.max(0, estoque - 1) }).eq('id', ing.id);
                                                if (error) alert(error.message); else fetchData();
                                            }}
                                            className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm transition-colors"
                                        >
                                            <Minus size={18} />
                                        </button>
                                        <span className="text-xs font-black text-gray-400 uppercase">Ajuste Rápido</span>
                                        <button
                                            onClick={async () => {
                                                const { error } = await supabase.from('ingredientes').update({ quantidade_estoque: estoque + 1 }).eq('id', ing.id);
                                                if (error) alert(error.message); else fetchData();
                                            }}
                                            className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-gray-400 hover:text-green-500 shadow-sm transition-colors"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>

                                    <Button
                                        variant="secondary"
                                        className="w-full py-2 h-10 text-xs border-gray-100 hover:bg-gray-100"
                                        onClick={() => {
                                            const val = prompt(`Novo estoque para ${ing.nome}:`, estoque);
                                            if (val !== null && !isNaN(val)) {
                                                supabase.from('ingredientes').update({ quantidade_estoque: Number(val) }).eq('id', ing.id).then(({ error }) => {
                                                    if (error) alert(error.message); else fetchData();
                                                });
                                            }
                                        }}
                                    >
                                        Editar Manual
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div >
        );
    };

    const renderReceitas = () => {
        if (editingItem?.isForm) return <RecipeForm onCancel={() => { setEditingItem(null); fetchData(); }} ingredientes={ingredientes} embalagens={embalagens} cvs={custosVariaveis} cfs={custosFixos} imps={impostos} ingredientesBase={ingredientesBase} editingRecipe={editingItem?.id ? editingItem : null} />;

        const filtered = receitas.filter(r => r.categoria !== 'Cobertura' && r.categoria !== 'Recheio');

        return (
            <div className="space-y-10">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-black text-dark tracking-tight">Receitas</h2>
                        <p className="text-sm text-pink-500 font-bold">Cada mudança nos preços atualiza o valor dos seus bolos automaticamente</p>
                    </div>
                    <Button onClick={() => setEditingItem({ isForm: true })} className="h-14 px-8 rounded-2xl">
                        <Plus /> Nova Receita
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filtered.map(r => {
                        // Dynamic Calculation
                        const baseCost = ingredientesBase.reduce((a, rb) => a + (Number(ingredientes.find(i => i.id === rb.ingrediente_id)?.preco_unitario || 0) * rb.quantidade), 0);
                        const ingCost = r.receita_ingredientes?.reduce((a, ri) => a + (Number(ingredientes.find(i => i.id === ri.ingrediente_id)?.preco_unitario || 0) * ri.quantidade), 0) || 0;
                        const embCost = r.receita_embalagens?.reduce((a, re) => a + (Number(embalagens.find(e => e.id === re.embalagem_id)?.custo_unitario || 0) * re.quantidade), 0) || 0;

                        // Respeitar configuração salva ou usar padrão
                        const config = r.config || { incluir_energia: false, incluir_gas: false, incluir_custo_fixo: false, incluir_impostos: true };
                        const prepTime = r.tempo_preparo_minutos || 30;
                        const ovenTime = r.tempo_forno_minutos || 45;

                        const energy = config.incluir_energia ? (prepTime + ovenTime) / 60 * (custosVariaveis.find(c => c.tipo === 'energia')?.custo_por_hora || 0) : 0;
                        const gas = config.incluir_gas ? (ovenTime / 60) * (custosVariaveis.find(c => c.tipo === 'gas')?.custo_por_hora || 0) : 0;
                        const fixo = config.incluir_custo_fixo ? 15 : 0;

                        const total = baseCost + ingCost + embCost + energy + gas + fixo;
                        const taxes = config.incluir_impostos ? impostos.reduce((a, c) => a + Number(c.percentual), 0) : 0;
                        const sugg = (total * (1 + (Number(r.margem_lucro || 100) / 100))) / (1 - (taxes / 100));

                        return (
                            <Card key={r.id} className="relative group overflow-hidden border-none shadow-sm hover:shadow-2xl hover:-translate-y-1">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
                                <Badge className="absolute top-4 right-4 z-10">{r.categoria}</Badge>
                                <div className="relative z-10">
                                    <div className="p-3 bg-pink-100 w-fit rounded-2xl mb-4 text-primary">
                                        <ChefHat size={28} />
                                    </div>
                                    <h4 className="text-xl font-black mb-1 text-dark leading-tight">{r.nome}</h4>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6 divider">
                                        {r.rendimento_fatias} fatias
                                    </p>

                                    <div className="space-y-2 mb-6">
                                        <div className="flex justify-between text-[11px] font-bold">
                                            <span className="text-gray-400 uppercase">Custo Massa Base:</span>
                                            <span className="text-dark">{formatCurrency(baseCost)}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px] font-bold">
                                            <span className="text-gray-400 uppercase">Insumos Extras:</span>
                                            <span className="text-dark">{formatCurrency(ingCost)}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px] font-bold">
                                            <span className="text-gray-400 uppercase">Embalagem:</span>
                                            <span className="text-dark">{formatCurrency(embCost)}</span>
                                        </div>
                                        {(energy + gas > 0) && (
                                            <div className="flex justify-between text-[11px] font-bold">
                                                <span className="text-gray-400 uppercase">Utilidades (Gás/Luz):</span>
                                                <span className="text-dark">{formatCurrency(energy + gas)}</span>
                                            </div>
                                        )}
                                        <div className="flex gap-1.5 mt-2 opacity-40">
                                            {config.incluir_energia && <div className="p-1.5 bg-gray-100 rounded-lg" title="Energia Elétrica"><Zap size={10} /></div>}
                                            {config.incluir_gas && <div className="p-1.5 bg-gray-100 rounded-lg" title="Gás"><Flame size={10} /></div>}
                                            {config.incluir_custo_fixo && <div className="p-1.5 bg-gray-100 rounded-lg" title="Custo Fixo"><Box size={10} /></div>}
                                            {config.incluir_impostos && <div className="p-1.5 bg-gray-100 rounded-lg" title="Impostos/Taxas"><Percent size={10} /></div>}
                                        </div>
                                        <div className="h-px bg-gray-50 my-2" />
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-black text-gray-400 uppercase tracking-tighter">Sugerido:</span>
                                            <span className="text-2xl font-black text-primary">{formatCurrency(sugg)}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button variant="secondary" className="flex-1 py-3" onClick={() => setEditingItem({ ...r, isForm: true })}>
                                            <Edit2 size={16} /> Editar
                                        </Button>
                                        <button onClick={() => deleteItem('receitas', r.id)} className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>
        );
    };


    return (
        <div className="flex h-screen bg-[#FFF0F5] overflow-hidden font-sans text-dark selection:bg-primary/20">
            {/* --- SIDEBAR --- */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-40 w-72 bg-white/80 backdrop-blur-xl border-r border-white/40 shadow-2xl transition-all duration-500 lg:static lg:block",
                sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                <div className="h-full flex flex-col bg-gradient-to-b from-white to-pink-50/30">
                    <div className="p-8 flex-1 flex flex-col overflow-hidden">
                        <div className="flex items-center gap-4 mb-14 group px-2 cursor-pointer transition-transform hover:scale-105 active:scale-95">
                            <div className="p-3.5 bg-primary rounded-3xl shadow-lg shadow-pink-200 rotate-6 group-hover:rotate-0 transition-transform duration-500">
                                <ChefHat className="text-white" size={32} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-dark tracking-tighter leading-none">Doce Encanto</h1>
                                <p className="text-[9px] text-pink-500 font-black uppercase tracking-[0.2em] mt-1.5 opacity-70">Sistema de Precificação</p>
                            </div>
                        </div>

                        <nav className="flex-1 space-y-3 overflow-y-auto pr-2 scrollbar-hide">
                            <NavButton active={activeTab === 'dashboard'} icon={<LayoutDashboard size={20} />} label="Dashboard" onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }} />
                            <NavButton active={activeTab === 'receitas'} icon={<ChefHat size={20} />} label="Receitas" onClick={() => { setActiveTab('receitas'); setSidebarOpen(false); }} />
                            <NavButton active={activeTab === 'coberturas'} icon={<Calculator size={20} />} label="Coberturas" onClick={() => { setActiveTab('coberturas'); setSidebarOpen(false); }} />
                            <div className="h-px bg-pink-100/50 my-6 mx-4" />
                            <NavButton active={activeTab === 'estoque'} icon={<Box size={20} />} label="Estoque" onClick={() => { setActiveTab('estoque'); setSidebarOpen(false); }} />
                            <NavButton active={activeTab === 'massa_base'} icon={<Layers size={20} />} label="MASSA BASE" onClick={() => { setActiveTab('massa_base'); setSidebarOpen(false); }} />
                            <NavButton active={activeTab === 'ingredientes'} icon={<Wheat size={20} />} label="Ingredientes" onClick={() => { setActiveTab('ingredientes'); setSidebarOpen(false); }} />
                            <NavButton active={activeTab === 'embalagens'} icon={<Package size={20} />} label="Embalagens" onClick={() => { setActiveTab('embalagens'); setSidebarOpen(false); }} />
                            <div className="h-px bg-pink-100/50 my-6 mx-4" />
                            <NavButton active={activeTab === 'vendas'} icon={<ShoppingBag size={20} />} label="Vendas" onClick={() => { setActiveTab('vendas'); setSidebarOpen(false); }} />
                            <NavButton active={activeTab === 'relatorios'} icon={<BarChart3 size={20} />} label="Relatórios" onClick={() => { setActiveTab('relatorios'); setSidebarOpen(false); }} />
                        </nav>
                    </div>

                    <div className="p-8 border-t border-pink-100/50 bg-white/40">
                        <div className="p-5 bg-white shadow-xl shadow-pink-100/30 rounded-[28px] border border-white mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-pink-400 flex items-center justify-center text-white shadow-lg">
                                    <User size={20} />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs font-black text-dark uppercase truncate leading-none mb-1">{userEmail}</p>
                                    <p className="text-[9px] text-pink-500 font-bold uppercase tracking-widest opacity-60">Minha Conta</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-red-400 hover:bg-red-50 transition-all duration-300 group"
                        >
                            <LogOut size={20} className="group-hover:scale-110 transition-transform" />
                            <span className="text-sm tracking-wide">Sair do Sistema</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 overflow-y-auto relative scroll-smooth bg-gradient-to-br from-[#FFF0F5] via-white to-pink-50/20">
                <header className="sticky top-0 z-20 bg-white/60 backdrop-blur-2xl border-b border-white/40 px-10 py-6 flex justify-between items-center shadow-sm">
                    <button className="lg:hidden p-3 bg-white shadow-lg rounded-2xl active:scale-90 transition-transform" onClick={() => setSidebarOpen(true)}>
                        <Menu size={20} />
                    </button>
                    <div className="hidden lg:block">
                        <h1 className="text-sm font-black text-dark uppercase tracking-[0.3em] mb-1 opacity-60">{activeTab.replace('_', ' ')}</h1>
                        <p className="text-xs text-pink-500 font-bold uppercase tracking-widest">Visão Geral do Sistema</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-sm font-black text-dark leading-none truncate max-w-[150px]">{userEmail}</p>
                            <p className="text-[10px] text-pink-500 font-bold mt-1">MINHA CONTA</p>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-primary shadow-lg shadow-pink-200 flex items-center justify-center text-white">
                            <User size={24} />
                        </div>
                    </div>
                </header>
                <div className="px-6 py-8 md:px-12 md:py-10">
                    {isLoading ? <div className="h-[60vh] flex items-center justify-center"><div className="w-12 h-12 border-4 border-pink-100 border-t-primary rounded-full animate-spin" /></div> : (
                        <>
                            {activeTab === 'dashboard' && renderDashboard()}
                            {activeTab === 'massa_base' && renderMassaBase()}
                            {activeTab === 'ingredientes' && renderIngredientes()}
                            {activeTab === 'embalagens' && renderEmbalagens()}
                            {activeTab === 'receitas' && renderReceitas()}
                            {activeTab === 'coberturas' && renderCoberturas()}
                            {activeTab === 'estoque' && renderEstoque()}
                            {activeTab === 'custos' && renderCustos()}
                            {activeTab === 'vendas' && renderVendas()}
                            {activeTab === 'relatorios' && renderRelatorios()}
                        </>
                    )}
                </div>
            </main>
            {sidebarOpen && <div className="fixed inset-0 bg-dark/20 backdrop-blur z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
        </div>
    );
}

function RecipeForm({ onCancel, ingredientes, embalagens, cvs, cfs, imps, ingredientesBase, editingRecipe }) {
    const [form, setForm] = useState(editingRecipe ? {
        nome: editingRecipe.nome,
        categoria: editingRecipe.categoria,
        rendimento: editingRecipe.rendimento || 1,
        rendimento_fatias: editingRecipe.rendimento_fatias || 1,
        tempo_preparo_minutos: editingRecipe.tempo_preparo_minutos || 30,
        tempo_forno_minutos: editingRecipe.tempo_forno_minutos || 45,
        margem_lucro: editingRecipe?.margem_lucro || 100,
        items: editingRecipe?.receita_ingredientes || [],
        packing: editingRecipe?.receita_embalagens || [],
        config: editingRecipe?.config || {
            incluir_energia: false,
            incluir_gas: false,
            incluir_custo_fixo: false,
            incluir_impostos: true
        }
    } : {
        nome: '',
        categoria: 'Tradicional',
        rendimento: 1,
        rendimento_fatias: 1,
        tempo_preparo_minutos: 30,
        tempo_forno_minutos: 45,
        margem_lucro: 100,
        items: [],
        packing: [],
        config: {
            incluir_energia: false,
            incluir_gas: false,
            incluir_custo_fixo: false,
            incluir_impostos: true
        }
    });

    const [formSearchQuery, setFormSearchQuery] = useState('');

    const calcs = useMemo(() => {
        const isExtra = form.categoria === 'Cobertura' || form.categoria === 'Recheio';
        const baseCost = isExtra ? 0 : ingredientesBase.reduce((a, r) => a + (Number(ingredientes.find(i => i.id === r.ingrediente_id)?.preco_unitario || 0) * r.quantidade), 0);
        const ing = form.items.reduce((a, r) => a + (Number(ingredientes.find(i => i.id === r.ingrediente_id)?.preco_unitario || 0) * r.quantidade), 0);
        const emb = form.packing.reduce((a, r) => a + (Number(embalagens.find(e => e.id === r.embalagem_id)?.custo_unitario || 0) * r.quantidade), 0);

        const energy = form.config.incluir_energia ? (form.tempo_preparo_minutos + form.tempo_forno_minutos) / 60 * (cvs.find(c => c.tipo === 'energia')?.custo_por_hora || 0) : 0;
        const gas = form.config.incluir_gas ? (form.tempo_forno_minutos / 60) * (cvs.find(c => c.tipo === 'gas')?.custo_por_hora || 0) : 0;
        const fixo = form.config.incluir_custo_fixo ? 15 : 0; // Rateado fixo

        const total = baseCost + ing + emb + energy + gas + fixo;
        const taxesPercent = form.config.incluir_impostos ? imps.reduce((a, c) => a + Number(c.percentual), 0) : 0;
        const sugg = (total * (1 + (form.margem_lucro / 100))) / (1 - (taxesPercent / 100));

        return { baseCost, ing, emb, energy, gas, total, sugg, taxesPercent, fixo };
    }, [form, ingredientes, embalagens, cvs, imps, ingredientesBase]);

    const filteredIngredientes = useMemo(() => {
        return ingredientes.filter(i => i.nome.toLowerCase().includes(formSearchQuery.toLowerCase())).slice(0, 5);
    }, [ingredientes, formSearchQuery]);

    const addItem = (ing) => {
        const val = prompt(`Quantidade de ${ing.nome} (${ing.unidade}): `, "1");
        if (val && !isNaN(val)) {
            setForm(prev => ({
                ...prev,
                items: [...prev.items, { ingrediente_id: ing.id, quantidade: Number(val) }]
            }));
            setFormSearchQuery('');
        }
    };

    const addPacking = (emb) => {
        const val = prompt(`Quantidade de ${emb.nome}: `, "1");
        if (val && !isNaN(val)) {
            setForm(prev => ({
                ...prev,
                packing: [...prev.packing, { embalagem_id: emb.id, quantidade: Number(val) }]
            }));
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 pb-32 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex-1 space-y-8">
                <div className="flex gap-4 items-center mb-4">
                    <button onClick={onCancel} className="p-3 bg-white border border-pink-100 rounded-2xl text-primary hover:bg-pink-50 transition-all">
                        <ChevronRight size={24} className="rotate-180" />
                    </button>
                    <div>
                        <h2 className="text-3xl font-black text-dark tracking-tight">Nova Receita</h2>
                        <p className="text-pink-500 font-bold uppercase text-[10px] tracking-widest">Montagem e Precificação</p>
                    </div>
                </div>

                <Card title="Informações Básicas" className="border-none shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Nome da Receita" placeholder="Ex: Bolo de Cenoura" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
                        <Select label="Categoria" value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} options={[
                            { value: 'Tradicional', label: 'Tradicional' },
                            { value: 'Gourmet', label: 'Gourmet' },
                            { value: 'Festas', label: 'Festas' },
                            { value: 'Cobertura', label: 'Cobertura' },
                            { value: 'Recheio', label: 'Recheio' }
                        ]} />
                    </div>
                </Card>

                <Card title="Ingredientes & Coberturas" subtitle="Selecione o ingrediente para adicionar à ficha">
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                        <input type="text" placeholder="Buscar ingrediente..." className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-pink-50 focus:border-primary outline-none transition-all" value={formSearchQuery} onChange={e => setFormSearchQuery(e.target.value)} />
                        {formSearchQuery && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-pink-50 z-50 overflow-hidden divide-y divide-gray-50">
                                {filteredIngredientes.map(i => (
                                    <button key={i.id} onClick={() => addItem(i)} className="w-full px-6 py-4 text-left hover:bg-pink-50 flex justify-between items-center transition-colors">
                                        <span className="font-bold text-dark">{i.nome}</span>
                                        <span className="text-xs font-black text-primary px-3 py-1 bg-pink-100 rounded-lg">{formatCurrency(i.preco_unitario)} / {i.unidade}</span>
                                    </button>
                                ))}
                                {filteredIngredientes.length === 0 && <div className="p-6 text-center text-gray-400 font-medium">Nenhum ingrediente encontrado</div>}
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        {form.items.map((it, idx) => {
                            const ing = ingredientes.find(i => i.id === it.ingrediente_id);
                            return (
                                <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary font-black shadow-sm">{idx + 1}</div>
                                        <div><p className="font-bold text-dark">{ing?.nome}</p><p className="text-xs text-gray-400 uppercase font-black">{it.quantidade} {ing?.unidade}</p></div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-black text-dark">{formatCurrency(Number(ing?.preco_unitario) * it.quantidade)}</span>
                                        <button onClick={() => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) })} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            );
                        })}
                        {form.items.length === 0 && <p className="text-center py-6 text-gray-400 font-medium italic">Nenhum ingrediente extra adicionado</p>}
                    </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card title="Tempo de Produção">
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Preparo (min)" type="number" value={form.tempo_preparo_minutos} onChange={e => setForm({ ...form, tempo_preparo_minutos: Number(e.target.value) })} />
                            <Input label="Forno (min)" type="number" value={form.tempo_forno_minutos} onChange={e => setForm({ ...form, tempo_forno_minutos: Number(e.target.value) })} />
                        </div>
                    </Card>
                    <Card title="Rendimento">
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Rendimento (un)" type="number" value={form.rendimento} onChange={e => setForm({ ...form, rendimento: Number(e.target.value) })} />
                            <Input label="Fatias" type="number" value={form.rendimento_fatias} onChange={e => setForm({ ...form, rendimento_fatias: Number(e.target.value) })} />
                        </div>
                    </Card>
                </div>

                <Card title="Configuração de Custos" subtitle="Escolha o que incluir no preço final">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { id: 'incluir_energia', label: 'Energia Elétrica', icon: Zap },
                            { id: 'incluir_gas', label: 'Uso de Gás', icon: Flame },
                            { id: 'incluir_custo_fixo', label: 'Custo Fixo (Aluguel/Internet)', icon: Receipt },
                            { id: 'incluir_impostos', label: 'Impostos e Taxas', icon: Percent },
                        ].map(item => (
                            <label key={item.id} className={cn(
                                "flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer",
                                form.config?.[item.id] ? "border-primary bg-pink-50" : "border-gray-100 bg-white"
                            )}>
                                <div className="flex items-center gap-3">
                                    <div className={cn("p-2 rounded-lg", form.config?.[item.id] ? "bg-primary text-white" : "bg-gray-100 text-gray-400")}>
                                        <item.icon size={18} />
                                    </div>
                                    <span className={cn("font-bold text-sm", form.config?.[item.id] ? "text-primary" : "text-gray-500")}>{item.label}</span>
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={form.config?.[item.id] || false}
                                    onChange={() => setForm({
                                        ...form,
                                        config: { ...form.config, [item.id]: !form.config?.[item.id] }
                                    })}
                                />
                                <div className={cn(
                                    "w-10 h-6 rounded-full relative transition-all",
                                    form.config?.[item.id] ? "bg-primary" : "bg-gray-200"
                                )}>
                                    <div className={cn(
                                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                        form.config?.[item.id] ? "left-5" : "left-1"
                                    )} />
                                </div>
                            </label>
                        ))}
                    </div>
                </Card>

                <Card title="Embalagem Selecionada">
                    <div className="flex flex-wrap gap-2 mb-6">
                        {embalagens.map(emb => (
                            <button key={emb.id} onClick={() => addPacking(emb)} className="px-4 py-2 bg-pink-50 border border-pink-100 rounded-xl text-primary font-bold text-sm hover:bg-primary hover:text-white transition-all">+ {emb.nome}</button>
                        ))}
                    </div>
                    <div className="space-y-2">
                        {form.packing.map((p, idx) => {
                            const emb = embalagens.find(e => e.id === p.embalagem_id);
                            return (
                                <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl group/item">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-dark">{emb?.nome}</span>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">{p.quantidade} unidades</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col text-right">
                                            <span className="font-black text-primary">{formatCurrency(emb?.custo_unitario * p.quantidade)}</span>
                                            <span className="text-[9px] text-gray-400 font-bold">{formatCurrency(emb?.custo_unitario)} cada</span>
                                        </div>
                                        <button onClick={() => setForm({ ...form, packing: form.packing.filter((_, i) => i !== idx) })} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-all"><X size={18} /></button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            <aside className="w-full lg:w-96 space-y-6">
                <div className="sticky top-6 space-y-6">
                    <Card className="bg-dark text-white border-none shadow-2xl relative overflow-hidden group p-8">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500"><Calculator size={120} /></div>
                        <h3 className="text-xl font-black mb-8 text-primary tracking-widest uppercase pb-4 border-b border-white/10 flex items-center gap-3"><TrendingUp size={24} /> Resumo Financeiro</h3>

                        <div className="space-y-4 mb-10 text-sm">
                            <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                                <span className="opacity-60 font-bold">Massa Base:</span><span className="font-black">{formatCurrency(calcs.baseCost)}</span>
                            </div>
                            <div className="flex justify-between items-center p-4">
                                <span className="opacity-60 font-bold">Insumos Adicionais:</span><span className="font-black">{formatCurrency(calcs.ing)}</span>
                            </div>
                            <div className="flex justify-between items-center p-4">
                                <span className="opacity-60 font-bold">Embalagem:</span><span className="font-black">{formatCurrency(calcs.emb)}</span>
                            </div>
                            {form.config.incluir_energia || form.config.incluir_gas ? (
                                <div className="flex justify-between items-center p-4">
                                    <span className="opacity-60 font-bold">Utilidades (Luz/Gás):</span><span className="font-black">{formatCurrency(calcs.energy + calcs.gas)}</span>
                                </div>
                            ) : null}
                            {form.config.incluir_custo_fixo ? (
                                <div className="flex justify-between items-center p-4">
                                    <span className="opacity-60 font-bold">Custo Fixo Rateado:</span><span className="font-black">{formatCurrency(calcs.fixo)}</span>
                                </div>
                            ) : null}
                            <div className="flex justify-between items-center p-4 border-t border-white/10 pt-6">
                                <span className="text-lg font-black text-white">CUSTO PRODUÇÃO:</span><span className="text-lg font-black text-primary">{formatCurrency(calcs.total)}</span>
                            </div>
                        </div>

                        <div className="px-2 mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs font-black uppercase tracking-widest text-primary">Margem de Lucro: {form.margem_lucro}%</span>
                                {form.config.incluir_impostos && (
                                    <span className="text-[10px] text-gray-400 font-bold">Impostos: {calcs.taxesPercent}%</span>
                                )}
                            </div>
                            <input type="range" min="30" max="300" step="5" value={form.margem_lucro} onChange={e => setForm({ ...form, margem_lucro: Number(e.target.value) })} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary" />
                        </div>

                        <div className="bg-primary p-8 rounded-[40px] text-center shadow-2xl ring-8 ring-dark">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Sugestão de Venda</p>
                            <div className="text-5xl font-black mb-2 tracking-tighter">{formatCurrency(calcs.sugg)}</div>
                            <p className="text-[10px] font-bold opacity-60">Lucro Estimado: {formatCurrency(calcs.sugg * (1 - calcs.taxesPercent / 100) - calcs.total)} por unidade</p>
                        </div>
                    </Card>

                    <Button onClick={async () => {
                        const payload = {
                            nome: form.nome,
                            categoria: form.categoria,
                            rendimento: form.rendimento,
                            margem_lucro: form.margem_lucro
                        };

                        let recipeId;
                        if (editingRecipe) {
                            await supabase.from('receitas').update(payload).eq('id', editingRecipe.id);
                            recipeId = editingRecipe.id;
                            // Limpar itens antigos
                            await supabase.from('receita_ingredientes').delete().eq('receita_id', recipeId);
                            await supabase.from('receita_embalagens').delete().eq('receita_id', recipeId);
                        } else {
                            const { data, error } = await supabase.from('receitas').insert([payload]).select();
                            if (error) { alert(error.message); return; }
                            recipeId = data[0].id;
                        }

                        // LocalStorage Persistence Bridge
                        const localConfigs = JSON.parse(localStorage.getItem('recipe_configs') || '{}');
                        localConfigs[recipeId] = {
                            config: form.config,
                            tempo_preparo_minutos: form.tempo_preparo_minutos,
                            tempo_forno_minutos: form.tempo_forno_minutos,
                            rendimento_fatias: form.rendimento_fatias
                        };
                        localStorage.setItem('recipe_configs', JSON.stringify(localConfigs));

                        // Salvar ingredientes e embalagens
                        if (form.items.length > 0) {
                            await supabase.from('receita_ingredientes').insert(form.items.map(it => ({
                                receita_id: recipeId,
                                ingrediente_id: it.ingrediente_id,
                                quantidade: it.quantidade
                            })));
                        }
                        if (form.packing.length > 0) {
                            await supabase.from('receita_embalagens').insert(form.packing.map(it => ({
                                receita_id: recipeId,
                                embalagem_id: it.embalagem_id,
                                quantidade: it.quantidade || 1
                            })));
                        }

                        onCancel();
                    }} className="w-full h-20 rounded-[35px] text-xl shadow-2xl shadow-pink-200">
                        <Save size={24} /> SALVAR RECEITA
                    </Button>
                </div>
            </aside>
        </div>
    );
}

function NavButton({ icon, label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-300 group",
                active
                    ? "bg-primary text-white shadow-lg shadow-pink-200"
                    : "text-gray-400 hover:bg-pink-50 hover:text-primary"
            )}
        >
            <span className={cn("transition-transform duration-300 group-hover:scale-110", active && "scale-110")}>{icon}</span>
            <span className="text-sm tracking-wide">{label}</span>
            {active && <ChevronRight size={16} className="ml-auto opacity-50" />}
        </button>
    );
}

