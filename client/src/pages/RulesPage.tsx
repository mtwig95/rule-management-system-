import { useEffect, useState } from 'react';
import { getRulesByTenant } from '../api/rules';

const tenantId = 'org123';

export const RulesPage = () => {
    const [rules, setRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getRulesByTenant(tenantId)
            .then((data) => {
                setRules(data.data);
            })
            .catch((err) => {
                console.error('Failed to fetch rules', err);
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <h2>Rules</h2>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <ul>
                    {rules.map((rule) => (
                        <li key={rule._id}>
                            {rule.action} – {rule.source?.map((s: any) => s.name).join(', ')} → {rule.destination?.map((d: any) => d.name).join(', ')}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
