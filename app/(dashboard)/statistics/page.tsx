'use client';

import { useState, useMemo } from 'react';
import { mockReservations, mockRestaurant } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    STATS_PERIODS,
    calculateStats,
    getReservationsByDay,
    getReservationsByDayOfWeek,
    getTopDays
} from '@/lib/utils/stats-calculator';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import {
    TrendingUp,
    Users,
    Calendar,
    CheckCircle,
} from 'lucide-react';

const COLORS = {
    primary: '#6366f1',
    primaryLight: '#818cf8',
    success: '#22c55e',
    successLight: '#4ade80',
    warning: '#eab308',
    warningLight: '#facc15',
    danger: '#ef4444',
    lunch: '#f59e0b',
    lunchLight: '#fbbf24',
    dinner: '#3b82f6',
    dinnerLight: '#60a5fa',
    muted: '#94a3b8',
};

export default function StatisticsPage() {
    const [selectedPeriod, setSelectedPeriod] = useState('month');

    const period = useMemo(
        () => STATS_PERIODS.find((p) => p.value === selectedPeriod) || STATS_PERIODS[1],
        [selectedPeriod]
    );

    const stats = useMemo(
        () => calculateStats(mockReservations, period.start, period.end),
        [period]
    );

    const dailyData = useMemo(
        () => getReservationsByDay(mockReservations, period.start, period.end),
        [period]
    );

    const weekdayData = useMemo(
        () => getReservationsByDayOfWeek(mockReservations),
        []
    );

    const topDays = useMemo(
        () => getTopDays(mockReservations, 10),
        []
    );

    const serviceDistribution = [
        { name: 'Pranzo', value: stats.lunchCount, color: COLORS.lunch },
        { name: 'Cena', value: stats.dinnerCount, color: COLORS.dinner },
    ];

    const statusDistribution = [
        { name: 'Confermate', value: stats.confirmedCount, color: COLORS.success },
        { name: 'Completate', value: stats.completedCount, color: COLORS.primary },
        { name: 'In Attesa', value: stats.pendingCount, color: COLORS.warning },
    ];

    // Calculate occupancy rate
    const totalDays = Math.ceil((period.end.getTime() - period.start.getTime()) / (1000 * 60 * 60 * 24));
    const avgReservationsPerDay = stats.totalReservations / totalDays;
    const maxCapacityPerDay = mockRestaurant.maxCapacityLunch + mockRestaurant.maxCapacityDinner;
    const occupancyRate = Math.round((stats.totalGuests / (totalDays * maxCapacityPerDay)) * 100);

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background border rounded-lg shadow-lg p-3">
                    <p className="font-semibold mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: <span className="font-bold">{entry.value}</span>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Statistiche</h1>
                    <p className="text-muted-foreground mt-1">
                        Analisi e andamento del ristorante
                    </p>
                </div>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {STATS_PERIODS.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                                {p.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-primary">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Prenotazioni</CardTitle>
                        <Calendar className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalReservations}</div>
                        <p className="text-xs text-muted-foreground">
                            {Math.round(avgReservationsPerDay * 10) / 10}/giorno
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Coperti</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalGuests}</div>
                        <p className="text-xs text-muted-foreground">
                            Media {stats.avgGuestsPerReservation} per prenotazione
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Occupazione</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{occupancyRate}%</div>
                        <p className="text-xs text-muted-foreground">
                            Tasso medio
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Confermate</CardTitle>
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">{stats.confirmedCount}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.pendingCount} in attesa
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                    <TabsTrigger value="overview">Panoramica</TabsTrigger>
                    <TabsTrigger value="trends">Andamento</TabsTrigger>
                    <TabsTrigger value="distribution">Distribuzione</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    {/* Daily Reservations Trend with dual lines */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Andamento Prenotazioni Giornaliere</CardTitle>
                            <CardDescription>Pranzo vs Cena nel periodo selezionato</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={350}>
                                <AreaChart data={dailyData}>
                                    <defs>
                                        <linearGradient id="colorPranzo" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={COLORS.lunch} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={COLORS.lunch} stopOpacity={0.1} />
                                        </linearGradient>
                                        <linearGradient id="colorCena" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={COLORS.dinner} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={COLORS.dinner} stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="date"
                                        stroke="#64748b"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <YAxis
                                        stroke="#64748b"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        wrapperStyle={{ paddingTop: '20px' }}
                                        iconType="circle"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="pranzo"
                                        name="Pranzo"
                                        stroke={COLORS.lunch}
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorPranzo)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="cena"
                                        name="Cena"
                                        stroke={COLORS.dinner}
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorCena)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Weekday Performance */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance per Giorno della Settimana</CardTitle>
                            <CardDescription>Media prenotazioni per giorno</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={weekdayData}>
                                    <XAxis
                                        dataKey="day"
                                        stroke="#64748b"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <YAxis
                                        stroke="#64748b"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        wrapperStyle={{ paddingTop: '20px' }}
                                        iconType="circle"
                                    />
                                    <Bar
                                        dataKey="pranzo"
                                        name="Pranzo"
                                        fill={COLORS.lunch}
                                        radius={[8, 8, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="cena"
                                        name="Cena"
                                        fill={COLORS.dinner}
                                        radius={[8, 8, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="trends" className="space-y-4">
                    {/* Guests Trend with separate lines */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Andamento Coperti Giornalieri</CardTitle>
                            <CardDescription>Numero di coperti per pranzo e cena</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={dailyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#64748b"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <YAxis
                                        stroke="#64748b"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        wrapperStyle={{ paddingTop: '20px' }}
                                        iconType="circle"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="copertiPranzo"
                                        name="Coperti Pranzo"
                                        stroke={COLORS.lunch}
                                        strokeWidth={3}
                                        dot={{ fill: COLORS.lunch, r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="copertiCena"
                                        name="Coperti Cena"
                                        stroke={COLORS.dinner}
                                        strokeWidth={3}
                                        dot={{ fill: COLORS.dinner, r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Top Days */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top 10 Giorni</CardTitle>
                            <CardDescription>Giorni con più prenotazioni</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={topDays} layout="vertical">
                                    <XAxis type="number" stroke="#64748b" style={{ fontSize: '12px' }} />
                                    <YAxis
                                        dataKey="date"
                                        type="category"
                                        width={80}
                                        stroke="#64748b"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="count"
                                        name="Prenotazioni"
                                        fill={COLORS.primary}
                                        radius={[0, 8, 8, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="distribution" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Service Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Distribuzione Servizi</CardTitle>
                                <CardDescription>Pranzo vs Cena</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={serviceDistribution}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                            outerRadius={90}
                                            fill="#8884d8"
                                            dataKey="value"
                                            strokeWidth={2}
                                            stroke="#fff"
                                        >
                                            {serviceDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div className="text-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                                        <div className="text-2xl font-bold text-orange-600">{stats.lunchCount}</div>
                                        <div className="text-sm font-medium">Pranzi</div>
                                        <div className="text-xs text-muted-foreground">{stats.lunchGuests} coperti</div>
                                    </div>
                                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">{stats.dinnerCount}</div>
                                        <div className="text-sm font-medium">Cene</div>
                                        <div className="text-xs text-muted-foreground">{stats.dinnerGuests} coperti</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Status Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Distribuzione Stati</CardTitle>
                                <CardDescription>Stato delle prenotazioni</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={statusDistribution}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                            outerRadius={90}
                                            fill="#8884d8"
                                            dataKey="value"
                                            strokeWidth={2}
                                            stroke="#fff"
                                        >
                                            {statusDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="grid grid-cols-3 gap-2 mt-4">
                                    <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                                        <div className="text-xl font-bold text-green-600">{stats.confirmedCount}</div>
                                        <div className="text-xs font-medium">Confermate</div>
                                    </div>
                                    <div className="text-center p-3 bg-primary/10 rounded-lg">
                                        <div className="text-xl font-bold text-primary">{stats.completedCount}</div>
                                        <div className="text-xs font-medium">Completate</div>
                                    </div>
                                    <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                                        <div className="text-xl font-bold text-yellow-600">{stats.pendingCount}</div>
                                        <div className="text-xs font-medium">In Attesa</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
