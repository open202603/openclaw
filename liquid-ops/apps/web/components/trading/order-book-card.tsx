export function OrderBookCard() {
  const bids = [84210, 84200, 84195, 84188];
  const asks = [84218, 84225, 84233, 84241];

  return (
    <div className="card">
      <h3>Order Book</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Bid</th>
            <th>Ask</th>
          </tr>
        </thead>
        <tbody>
          {bids.map((bid, index) => (
            <tr key={bid}>
              <td style={{ color: '#7ef0b2' }}>{bid.toLocaleString()}</td>
              <td style={{ color: '#ff9eaa' }}>{asks[index].toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
