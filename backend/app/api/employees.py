from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.employee import Employee
from app.schemas.employee import (
    EmployeeCreateRequest,
    EmployeeListResponse,
    EmployeeResponse,
    EmployeeUpdateRequest,
)

router = APIRouter(prefix='/api', tags=['employees'])


@router.get('/employees', response_model=list[EmployeeListResponse])
def get_employees(db: Session = Depends(get_db)):
    employees = (
        db.query(Employee)
        .order_by(Employee.created_at.desc())
        .all()
    )

    return employees


@router.post('/employees', response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(payload: EmployeeCreateRequest, db: Session = Depends(get_db)):
    normalized_email = payload.normalized_email

    existing = db.query(Employee).filter(Employee.email == normalized_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                'message': 'An employee with this email already exists.',
                'employee_id': existing.id,
            },
        )

    employee = Employee(
        name=payload.name,
        email=normalized_email,
        role=payload.role,
        is_active=payload.is_active,
    )

    db.add(employee)
    db.commit()
    db.refresh(employee)

    return employee


@router.get('/employees/{employee_id}', response_model=EmployeeResponse)
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={'message': f'Employee {employee_id} was not found.'},
        )

    return employee


@router.put('/employees/{employee_id}', response_model=EmployeeResponse)
def update_employee(
    employee_id: int,
    payload: EmployeeUpdateRequest,
    db: Session = Depends(get_db),
):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={'message': f'Employee {employee_id} was not found.'},
        )

    updates = payload.model_dump(exclude_unset=True)

    if 'email' in updates:
        normalized_email = str(updates['email']).lower().strip()

        duplicate = (
            db.query(Employee)
            .filter(Employee.email == normalized_email, Employee.id != employee_id)
            .first()
        )
        if duplicate:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    'message': 'An employee with this email already exists.',
                    'employee_id': duplicate.id,
                },
            )

        updates['email'] = normalized_email

    for field, value in updates.items():
        setattr(employee, field, value)

    db.commit()
    db.refresh(employee)

    return employee


@router.delete('/employees/{employee_id}')
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={'message': f'Employee {employee_id} was not found.'},
        )

    db.delete(employee)
    db.commit()

    return {'message': f'Employee {employee_id} was deleted successfully.'}
