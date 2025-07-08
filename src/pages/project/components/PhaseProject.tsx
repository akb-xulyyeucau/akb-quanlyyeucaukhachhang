import React, { useEffect, useState, useCallback } from 'react';
import { Button, message, Steps, Empty, Space, Modal } from 'antd';
import type { IPhase, IProject } from '../interfaces/project.interface';
import {
  getPhaseByProjectId,
  createPhase,
  updatePhaseById
} from '../services/phase.service';
import dayjs from 'dayjs';
import PhaseFormModal from './PhaseFormModal';
import { PlusOutlined, EditOutlined, StepForwardOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface IPhaseProject {
  projectId: string;
  project?: IProject;
  projectStatus?: string;
  onEndingProject: (projectId: string) => void;
}

const PhaseProject: React.FC<IPhaseProject> = ({ projectId, project, projectStatus, onEndingProject }) => {
  const { t } = useTranslation('projectDetail');
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
      message.error(error.message || t('PhaseProject.message.uploadFailed'));
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
        message.success(t('PhaseProject.message.createSuccess'));
      } else if (phaseFormMode === 'edit' && phase?._id) {
        await updatePhaseById(phase._id, phaseData);
        message.success(t('PhaseProject.message.updateSuccess'));
      }

      await fetchPhase();
      setShowPhaseForm(false);
    } catch (error: any) {
      message.error(error.message || t('PhaseProject.message.handleFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleNextPhase = async () => {
    if (!phase?._id || !project) return;

    try {
      setLoading(true);
      await updatePhaseById(phase._id, {
        ...phase,
        currentPhase: phase.currentPhase + 1
      });
      await fetchPhase();
      message.success(t('PhaseProject.message.nextPhaseSwitchSuccess'));
    } catch (error: any) {
      message.error(error.message || t('PhaseProject.message.nextPhaseSwitchFailed'));
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
      message.error(error.message || t('PhaseProject.message.finalPhaseUpdateFailed'));
    } finally {
      setLoading(false);
    }
  };

  const showEndingPhaseConfirm = (_projectId: string) => {
    Modal.confirm({
      title: t('PhaseProject.endProjectConfirmTitle'),
      icon: <StepForwardOutlined />,
      content: t('PhaseProject.endProjectConfirmContent'),
      okText: t('PhaseProject.OkText'),
      cancelText: t('PhaseProject.CancelText'),
      onOk() {
        handleEndingProject();
      }
    });
  };

  const showNextPhaseConfirm = () => {
    Modal.confirm({
      title: t('PhaseProject.nextPhaseSwitchTitle'),
      icon: <StepForwardOutlined />,
      content: t('PhaseProject.nextPhaseSwitchContent'),
      okText: t('PhaseProject.OkText'),
      cancelText: t('PhaseProject.CancelText'),
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
              disabled={projectStatus === t('PhaseProject.isDone') ? true : false}
            >
              {t('PhaseProject.editPhase')}
            </Button>
            {phase.currentPhase === steps.length - 1 && (
              <Button
                type="primary"
                onClick={() => showEndingPhaseConfirm(projectId)}
                disabled={projectStatus === 'Đã hoàn thành'}
                loading={loading}
              >
                {t('PhaseProject.endProject')}
              </Button>
            )}
          </Space>
          <div style={{ paddingTop: 24 }}>
            <Steps current={phase.currentPhase} items={items} />
          </div>
          <div style={{ marginTop: 24 }}>
            {phase.currentPhase < steps.length - 1 && (
              <Button type="primary" onClick={showNextPhaseConfirm} loading={loading} icon={<StepForwardOutlined />}>
                {t('PhaseProject.nextPhase')}
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
            {t('PhaseProject.addProgress')}
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