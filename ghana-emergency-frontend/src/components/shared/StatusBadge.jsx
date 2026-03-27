import React from 'react';

const StatusBadge = ({ status }) => {
    const statusMap = {
        'CREATED': { 
            color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800', 
            icon: 'add_circle' 
        },
        'DISPATCHED': { 
            color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', 
            icon: 'local_shipping' 
        },
        'IN_PROGRESS': { 
            color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800', 
            icon: 'pending' 
        },
        'RESOLVED': { 
            color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800', 
            icon: 'check_circle' 
        },
        'CANCELLED': { 
            color: 'text-slate-600 bg-slate-50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800', 
            icon: 'cancel' 
        },
    };

    const config = statusMap[status] || statusMap['CREATED'];

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[10px] font-bold tracking-wider uppercase transition-all ${config.color}`}>
            <span className="material-symbols-outlined text-[14px] leading-none">
                {config.icon}
            </span>
            {status.replace('_', ' ')}
        </span>
    );
};

export default StatusBadge;
