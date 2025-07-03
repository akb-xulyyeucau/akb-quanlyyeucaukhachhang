import React, { useEffect, useState } from 'react';
import {
  Modal, Form, Input, Button, DatePicker, Space, Divider, message, Popconfirm,
  Pagination, Card
} from 'antd';
import {
  SaveOutlined,
  CloseOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { IPhase } from '../interfaces/project.interface';
import { useTranslation } from 'react-i18next';
// import { createPhase, updatePhaseById } from '../services/phase.service';

interface Props {
  mode: 'create' | 'edit';
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  phaseData?: IPhase;
}

const PhaseFormModal: React.FC<Props> = ({ mode, open, onClose, onSubmit, phaseData }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation('projectDetail');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 1; // Số giai đoạn hiển thị trên mỗi trang

  // Hàm cập nhật lại order cho tất cả các phases
  const updatePhasesOrder = () => {
    const values = form.getFieldValue('phases') || [];
    const updatedPhases = values.map((phase: any, index: number) => ({
      ...phase,
      order: index + 1
    }));
    form.setFieldValue('phases', updatedPhases);
  };

  useEffect(() => {
    if (open) {
      form.resetFields();
      setCurrentPage(1);
      if (mode === 'edit' && phaseData) {
        const clonedData = {
          ...phaseData,
          phases: phaseData.phases.map((p, index) => ({
            ...p,
            day: p.day ? dayjs(p.day) : null,
            order: index + 1 // Đảm bảo order được cập nhật khi edit
          }))
        };
        form.setFieldsValue(clonedData);
      }
    }
  }, [open, mode, phaseData]);

  const handleSubmit = async (values: any) => {
    try {
      // Đảm bảo order được cập nhật trước khi submit
      const phases = values.phases || [];
      const transformedValues = {
        ...values,
        phases: phases.map((phase: any, index: number) => ({
          ...phase,
          order: index + 1,
          day: phase.day ? phase.day.toISOString() : null,
        }))
      };

      onSubmit(transformedValues);
      onClose();
    } catch (error: any) {
      message.error(error.message || t('PhaseFormModal.message.isError'));
    }
  };

  const renderPaginationControls = (total: number) => {
    if (total <= itemsPerPage) return null;

    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
        <Pagination
          current={currentPage}
          total={total}
          pageSize={itemsPerPage}
          onChange={setCurrentPage}
          size="small"
        />
      </div>
    );
  };

  return (
    <Modal
      open={open}
      title={mode === 'create' ? t('PhaseFormModal.createPhase') : t('PhaseFormModal.editPhase')}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={800}
      style={{ top: 20 }}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
        <Card>
          <Form.Item
            label={t('PhaseFormModal.phaseGroupName')}
            name="name"
            rules={[{ required: true, message: t('PhaseFormModal.phaseGroupNameRequiered') }]}
          >
            <Input placeholder={t('PhaseFormModal.phaseGroupNamePlaceholder')} />
          </Form.Item>
        </Card>

        <Divider orientation="left">{t('PhaseFormModal.phasesDetail')}</Divider>

        <Form.List name="phases">
          {(fields, { add, remove }) => {
            const start = (currentPage - 1) * itemsPerPage;
            const end = currentPage * itemsPerPage;
            const currentFields = fields.slice(start, end);

            // Hàm xử lý thêm giai đoạn
            const handleAdd = () => {
              add({}, fields.length); // Thêm vào cuối danh sách
              setTimeout(() => {
                updatePhasesOrder();
                // Tính toán và chuyển đến trang mới nhất
                const totalPages = Math.ceil((fields.length + 1) / itemsPerPage);
                setCurrentPage(totalPages);
              }, 0);
            };

            // Hàm xử lý xóa giai đoạn
            const handleRemove = (name: number) => {
              remove(name);
              setTimeout(() => {
                updatePhasesOrder();
                // Tính toán lại tổng số trang sau khi xóa
                const totalPages = Math.ceil((fields.length - 1) / itemsPerPage);
                // Nếu trang hiện tại lớn hơn tổng số trang, chuyển về trang cuối
                if (currentPage > totalPages && totalPages > 0) {
                  setCurrentPage(totalPages);
                }
              }, 0);
            };

            return (
              <>
                {currentFields.map(({ key, name, ...restField }, index) => (
                  <Card
                    key={key}
                    style={{ marginBottom: 16 }}
                    title={`${t('PhaseFormModal.phaseTitle')} #${start + index + 1}`}
                    extra={
                      <Popconfirm
                        title={t('PhaseFormModal.deletePhaseTitle')}
                        description={t('PhaseFormModal.deletePhaseComfirm')}
                        onConfirm={() => handleRemove(name)}
                        okText={t('PhaseFormModal.okText')}
                        cancelText={t('PhaseFormModal.cancelText')}
                      >
                        <Button
                          icon={<DeleteOutlined />}
                          danger
                          type="link"
                        >
                          {t('PhaseFormModal.deletePhase')}
                        </Button>
                      </Popconfirm>
                    }
                  >
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      <Form.Item
                        {...restField}
                        label={t('PhaseFormModal.phaseFields.name')}
                        name={[name, 'name']}
                        rules={[{ required: true, message: t('PhaseFormModal.phaseFields.fieldRequired') }]}
                      >
                        <Input placeholder={t('PhaseFormModal.phaseFields.namePlaceholder')} />
                      </Form.Item>

                      <div style={{ display: 'flex', gap: 16 }}>
                        <Form.Item
                          {...restField}
                          label={`${t('PhaseFormModal.phaseFields.order')} (order)`}
                          style={{ flex: 1 }}
                        >
                          <Input
                            value={start + index + 1}
                            disabled
                            style={{ backgroundColor: '#f5f5f5' }}
                          />
                          <Form.Item
                            {...restField}
                            name={[name, 'order']}
                            hidden
                          >
                            <Input type="hidden" />
                          </Form.Item>
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          label={t('PhaseFormModal.phaseFields.startDate')}
                          name={[name, 'day']}
                          style={{ flex: 1 }}
                          rules={[{ required: true, message: t('PhaseFormModal.phaseFields.fieldRequired') }]}
                        >
                          <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                      </div>

                      <Form.Item
                        {...restField}
                        label={t('PhaseFormModal.phaseFields.description')}
                        name={[name, 'description']}
                      >
                        <Input.TextArea placeholder={t('PhaseFormModal.phaseFields.descriptionPlaceholder')} rows={3} />
                      </Form.Item>
                    </Space>
                  </Card>
                ))}

                {renderPaginationControls(fields.length)}

                <Form.Item style={{ marginTop: 16 }}>
                  <Button type="dashed" onClick={handleAdd} block icon={<PlusOutlined />}>
                    {t('PhaseFormModal.addPhase')}
                  </Button>
                </Form.Item>
              </>
            );
          }}
        </Form.List>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <Button icon={<CloseOutlined />} onClick={onClose}>
            {t('PhaseFormModal.cancelText')}
          </Button>
          <Button type="primary" icon={<SaveOutlined />} htmlType="submit">
            {mode === 'create' ? t('PhaseFormModal.addNew') : t('PhaseFormModal.saveChange')}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default PhaseFormModal;