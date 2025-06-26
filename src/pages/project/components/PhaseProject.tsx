import React, { useEffect, useState, useCallback } from 'react';
import { Button, message, Steps, Empty, Space, Modal } from 'antd';
import type { IPhase } from '../interfaces/project.interface';
import {
  getPhaseByProjectId,
  createPhase,
  updatePhaseById
} from '../services/phase.service';
import dayjs from 'dayjs';
import PhaseFormModal from './PhaseFormModal';
import { PlusOutlined, EditOutlined, StepForwardOutlined } from '@ant-design/icons';

interface IPhaseProject {
  projectId: string,
  projectStatus?: string,
  onEndingProject: (projectId: string) => void
}

const PhaseProject: React.FC<IPhaseProject> = ({ projectId, projectStatus, onEndingProject }) => {
  const [phase, setPhase] = useState<IPhase>();
  const [showPhaseForm, setShowPhaseForm] = useState(false);
  const [phaseFormMode, setPhaseFormMode] = useState<'create' | 'edit'>('create');
  const [loading, setLoading] = useState(false);

  // Sử dụng useCallback để tránh tạo lại hàm fetchPhase mỗi lần render
  const fetchPhase = useCallback(async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      const response = await getPhaseByProjectId(projectId);
      if (response?.data) {
        setPhase(response.data);
      }
    } catch (error: any) {
      message.error(error.message || 'Không thể tải dữ liệu giai đoạn');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchPhase();
  }, [fetchPhase]);

  const steps = phase?.phases.sort((tmp1, tmp2) => tmp1.order - tmp2.order) || [];
  const items = steps.map((item) => ({
    key: item.order?.toString() ?? item.name,
    title: item.name,
    description: item.day ? `Ngày: ${dayjs(item.day).format('DD/MM/YYYY')}\n ${item.description}` : undefined,
  }));

  const handleEdit = () => {
    setPhaseFormMode('edit');
    setShowPhaseForm(true);
  };

  const handleCreate = () => {
    setPhaseFormMode('create');
    setShowPhaseForm(true);
  };

  const handleFormSubmit = async (values: any) => {
    if (!projectId) return;

    try {
      setLoading(true);
      const phaseData = {
        ...values,
        projectId,
        currentPhase: phase?.currentPhase || 0
      };

      if (phaseFormMode === 'create') {
        await createPhase(phaseData);
        message.success('Tạo giai đoạn thành công');
      } else if (phaseFormMode === 'edit' && phase?._id) {
        await updatePhaseById(phase._id, phaseData);
        message.success('Cập nhật giai đoạn thành công');
      }

      await fetchPhase();
      setShowPhaseForm(false);
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra khi xử lý giai đoạn');
    } finally {
      setLoading(false);
    }
  };

  const handleNextPhase = async () => {
    if (!phase?._id) return;

    try {
      setLoading(true);
      await updatePhaseById(phase._id, {
        ...phase,
        currentPhase: phase.currentPhase + 1
      });
      await fetchPhase();
      message.success('Đã chuyển sang giai đoạn tiếp theo');
    } catch (error: any) {
      message.error(error.message || 'Không thể chuyển giai đoạn');
    } finally {
      setLoading(false);
    }
  };

  const handleEndingProject = async () => {
    if (!phase?._id || !steps.length) return;

    try {
      setLoading(true);
      // Cập nhật currentPhase thành phase cuối cùng
      await updatePhaseById(phase._id, {
        ...phase,
        currentPhase: steps.length 
      });
      await fetchPhase();
      // Gọi callback để kết thúc dự án
      onEndingProject(projectId);
    } catch (error: any) {
      message.error(error.message || 'Không thể cập nhật giai đoạn cuối cùng');
    } finally {
      setLoading(false);
    }
  };

  const showEndingPhaseConfirm = (_projectId: string) => {
    Modal.confirm({
      title: 'Xác nhận kết thúc dự án',
      icon: <StepForwardOutlined />,
      content: "Bạn có chắc chắn muốn kết thúc dự án này? Hành động này sẽ cập nhật trạng thái dự án thành 'Đã hoàn thành'",
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk() {
        handleEndingProject();
      }
    });
  };

  const showNextPhaseConfirm = () => {
    Modal.confirm({
      title: 'Chuyển giai đoạn tiếp theo',
      icon: <StepForwardOutlined />,
      content: "Bạn có chắc chắn muốn chuyển giai đoạn mới, hành động không thể hoàn tác!",
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk() {
        handleNextPhase();
      }
    });
  };

  return (
    <>
      {phase ?
        <>
        <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: '16px' }}>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={handleEdit}
            loading={loading}
            disabled = {projectStatus === 'Đã hoàn thành' ? true : false}
          >
            Chỉnh sửa giai đoạn
          </Button>
          {phase.currentPhase === steps.length - 1 && (
              <Button 
                type="primary" 
                onClick={() => showEndingPhaseConfirm(projectId)} 
                disabled={projectStatus === 'Đã hoàn thành'}
                loading={loading}
              >
                Hoàn thành
              </Button>
            )}
        </Space>
          <div style={{ paddingTop: 24 }}>
            <Steps current={phase.currentPhase} items={items} />
          </div>
          <div style={{ marginTop: 24 }}>
            {phase.currentPhase < steps.length - 1 && (
              <Button type="primary" onClick={showNextPhaseConfirm} loading={loading} icon = {<StepForwardOutlined/>}>
                Giai đoạn tiếp theo
              </Button>
            )}
            
            {/* {phase.currentPhase > 0 && (
              <Button style={{ margin: '0 8px' }} onClick={handlePreviousPhase} loading={loading}>
                Quay lại
              </Button>
            )} */}
          </div>
        </>
        :
        <>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            loading={loading}
          >
            Thêm tiến độ
          </Button>
          <Empty />
        </>
      }
      <PhaseFormModal
        mode={phaseFormMode}
        open={showPhaseForm}
        onClose={() => setShowPhaseForm(false)}
        onSubmit={handleFormSubmit}
        phaseData={phase}
      />
    </>
  );
};

export default PhaseProject;