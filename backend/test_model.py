from sqlmodel import SQLModel, Field

class Test(SQLModel, table=True):
    id: str = Field(primary_key=True)

print("OK")