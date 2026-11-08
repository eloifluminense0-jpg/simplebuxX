export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { amount, customer, items } = req.body;

    try {
        const response = await fetch('https://api.velanipagamentos.com.br/api/v1/api-gateway/v1/transactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.VELANI_SECRET_KEY
            },
            body: JSON.stringify({
                paymentMethod: 'pix',
                amount,
                customer,
                items
            })
        });

        const data = await response.json();

        // Se a Velani recusar, devolvemos o erro exato que veio da API deles
        if (!response.ok) {
            return res.status(response.status).json({ 
                error: 'Erro retornado pela Velani', 
                detalhes: data 
            });
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error('Erro na API da Velani:', error);
        return res.status(500).json({ error: error.message || 'Erro ao processar pagamento' });
    }
}
