from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.property import Property
from app.models.property_image import PropertyImage
from app.services.storage import delete_file, generate_signed_url, upload_file
from app.schemas.property import (
    PropertyCreateRequest,
    PropertyListResponse,
    PropertyResponse,
    PropertyStatusUpdateRequest,
    PropertyUpdateRequest,
)

router = APIRouter(prefix='/api', tags=['properties'])


@router.post('/properties', response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
def create_property(payload: PropertyCreateRequest, db: Session = Depends(get_db)):
    property_ = Property(
        title=payload.title,
        description=payload.description,
        property_type=payload.property_type,
        status=payload.status,
        price=payload.price,
        currency=payload.currency,
        location=payload.location,
        address=payload.address,
        size_value=payload.size_value,
        size_unit=payload.size_unit,
        bedrooms=payload.bedrooms,
        bathrooms=payload.bathrooms,
        is_featured=payload.is_featured,
    )

    db.add(property_)
    db.commit()
    db.refresh(property_)

    return property_


@router.get('/properties', response_model=list[PropertyListResponse])
def get_properties(db: Session = Depends(get_db)):
    properties = (
        db.query(Property)
        .order_by(Property.created_at.desc())
        .all()
    )

    responses = []

    for property_ in properties:
        response = PropertyListResponse.model_validate(property_)

        for image in response.images:
            image.image_url = generate_signed_url(image.image_url)

        responses.append(response)

    return responses


@router.get('/properties/{property_id}', response_model=PropertyResponse)
def get_property(property_id: int, db: Session = Depends(get_db)):
    property_ = db.query(Property).filter(Property.id == property_id).first()

    if not property_:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={'message': f'Property {property_id} was not found.'},
        )

    response = PropertyResponse.model_validate(property_)

    for image in response.images:
        image.image_url = generate_signed_url(image.image_url)

    return response


@router.put('/properties/{property_id}', response_model=PropertyResponse)
def update_property(
    property_id: int,
    payload: PropertyUpdateRequest,
    db: Session = Depends(get_db),
):
    property_ = db.query(Property).filter(Property.id == property_id).first()

    if not property_:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={'message': f'Property {property_id} was not found.'},
        )

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(property_, field, value)

    db.commit()
    db.refresh(property_)

    return property_


@router.delete('/properties/{property_id}')
def delete_property(property_id: int, db: Session = Depends(get_db)):
    property_ = db.query(Property).filter(Property.id == property_id).first()

    if not property_:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={'message': f'Property {property_id} was not found.'},
        )

    db.delete(property_)
    db.commit()

    return {'message': f'Property {property_id} was deleted successfully.'}


@router.patch('/properties/{property_id}/status', response_model=PropertyResponse)
def update_property_status(
    property_id: int,
    payload: PropertyStatusUpdateRequest,
    db: Session = Depends(get_db),
):
    property_ = db.query(Property).filter(Property.id == property_id).first()

    if not property_:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={'message': f'Property {property_id} was not found.'},
        )

    property_.status = payload.status

    db.commit()
    db.refresh(property_)

    return property_


@router.post('/properties/{property_id}/images')
async def upload_property_image(
    property_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    property_ = db.query(Property).filter(Property.id == property_id).first()

    if not property_:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={'message': f'Property {property_id} was not found.'},
        )

    file_data = await file.read()

    image_path = f'properties/{property_id}/{file.filename}'

    image_url = upload_file(
        file_data=file_data,
        destination_path=image_path,
        content_type=file.content_type or 'application/octet-stream',
    )

    property_image = PropertyImage(
        property_id=property_id,
        image_url=image_url,
    )

    db.add(property_image)
    db.commit()
    db.refresh(property_image)

    return property_image


@router.delete('/properties/{property_id}/images/{image_id}')
def delete_property_image(
    property_id: int,
    image_id: int,
    db: Session = Depends(get_db),
):
    property_image = (
        db.query(PropertyImage)
        .filter(
            PropertyImage.id == image_id,
            PropertyImage.property_id == property_id,
        )
        .first()
    )

    if not property_image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                'message': (
                    f'Property image {image_id} was not found '
                    f'for property {property_id}.'
                )
            },
        )

    delete_file(property_image.image_url)

    db.delete(property_image)
    db.commit()

    return {
        'message': (
            f'Property image {image_id} was deleted successfully.'
        )
    }


@router.patch('/properties/{property_id}/images/{image_id}/primary')
def set_primary_property_image(
    property_id: int,
    image_id: int,
    db: Session = Depends(get_db),
):
    property_image = (
        db.query(PropertyImage)
        .filter(
            PropertyImage.id == image_id,
            PropertyImage.property_id == property_id,
        )
        .first()
    )

    if not property_image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                'message': (
                    f'Property image {image_id} was not found '
                    f'for property {property_id}.'
                )
            },
        )

    (
        db.query(PropertyImage)
        .filter(
            PropertyImage.property_id == property_id,
            PropertyImage.id != image_id,
        )
        .update(
            {PropertyImage.is_primary: False},
            synchronize_session=False,
        )
    )

    property_image.is_primary = True

    db.commit()
    db.refresh(property_image)

    return property_image
