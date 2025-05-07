import React, { useEffect, useState } from 'react';
import { getReports } from '../services/api';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await getReports();
                setReports(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    if (loading) {
        return <div>Carregando relatórios...</div>;
    }

    if (error) {
        return <div>Erro ao carregar relatórios: {error}</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Relatórios Financeiros</h2>
            <table className="min-w-full bg-white border border-gray-200">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">Data</th>
                        <th className="py-2 px-4 border-b">Descrição</th>
                        <th className="py-2 px-4 border-b">Valor</th>
                        <th className="py-2 px-4 border-b">Categoria</th>
                    </tr>
                </thead>
                <tbody>
                    {reports.map((report) => (
                        <tr key={report.id}>
                            <td className="py-2 px-4 border-b">{new Date(report.date).toLocaleDateString()}</td>
                            <td className="py-2 px-4 border-b">{report.description}</td>
                            <td className="py-2 px-4 border-b">{`R$ ${report.amount.toFixed(2)}`}</td>
                            <td className="py-2 px-4 border-b">{report.category}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Reports;