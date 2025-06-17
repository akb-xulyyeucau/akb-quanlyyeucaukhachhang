import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'antd';

const RequestResponse = () => {
  const {pId} = useParams();
  const navigate = useNavigate();
  return (
    <div>
      <h1>Request Response</h1>
      <Button onClick={() => navigate(`/customers-projects`)}>Quay lại</Button>
      <Button onClick={() => navigate(`/project/${pId}`)}>Xem chi tiết dự án</Button>
    </div>
  )
}

export default RequestResponse
