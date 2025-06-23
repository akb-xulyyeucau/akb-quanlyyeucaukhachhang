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
import { createPhase, updatePhaseById } from '../services/phase.service';

interface Props {
  mode: 'create' | 'edit';
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  phaseData?: IPhase;
}

const PhaseFormModal: React.FC<Props> = ({ mode, open, onClose, onSubmit, phaseData }) => {
  const [form] = Form.useForm();
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
      message.error(error.message || 'Có lỗi xảy ra');
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
      title={mode === 'create' ? 'Tạo giai đoạn' : 'Chỉnh sửa giai đoạn'}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={800}
      style={{ top: 20 }}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
        <Card>
          <Form.Item
            label="Tên nhóm giai đoạn"
            name="name"
            rules={[{ required: true, message: 'Không được để trống' }]}
          >
            <Input placeholder="Nhập tên nhóm giai đoạn" />
          </Form.Item>
        </Card>

        <Divider orientation="left">Chi tiết các giai đoạn</Divider>

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
                    title={`Giai đoạn #${start + index + 1}`}
                    extra={
                      <Popconfirm
                        title="Xác nhận xóa"
                        description="Bạn có chắc chắn muốn xóa giai đoạn này?"
                        onConfirm={() => handleRemove(name)}
                        okText="Xóa"
                        cancelText="Hủy"
                      >
                        <Button
                          icon={<DeleteOutlined />}
                          danger
                          type="link"
                        >
                          Xoá giai đoạn
                        </Button>
                      </Popconfirm>
                    }
                  >
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      <Form.Item
                        {...restField}
                        label="Tên giai đoạn"
                        name={[name, 'name']}
                        rules={[{ required: true, message: 'Không được để trống' }]}
                      >
                        <Input placeholder="Nhập tên giai đoạn" />
                      </Form.Item>

                      <div style={{ display: 'flex', gap: 16 }}>
                        <Form.Item
                          {...restField}
                          label="Thứ tự (order)"
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
                          label="Ngày bắt đầu"
                          name={[name, 'day']}
                          style={{ flex: 1 }}
                        >
                          <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                      </div>

                      <Form.Item
                        {...restField}
                        label="Mô tả"
                        name={[name, 'description']}
                      >
                        <Input.TextArea placeholder="Nhập mô tả (nếu có)" rows={3} />
                      </Form.Item>
                    </Space>
                  </Card>
                ))}

                {renderPaginationControls(fields.length)}

                <Form.Item style={{ marginTop: 16 }}>
                  <Button type="dashed" onClick={handleAdd} block icon={<PlusOutlined />}>
                    Thêm giai đoạn
                  </Button>
                </Form.Item>
              </>
            );
          }}
        </Form.List>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <Button icon={<CloseOutlined />} onClick={onClose}>
            Hủy
          </Button>
          <Button type="primary" icon={<SaveOutlined />} htmlType="submit">
            {mode === 'create' ? 'Tạo mới' : 'Lưu thay đổi'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default PhaseFormModal;
